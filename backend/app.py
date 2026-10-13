import logging
import re
import tempfile
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.utils import secure_filename

import database
from config import Config
from nlp import analyze_text
from speech import transcribe_audio


ALLOWED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".mp4", ".mpeg", ".mpga", ".webm", ".ogg", ".flac"}
ID_PATTERN = re.compile(r"^[0-9a-fA-F]{24}$")


def create_app(config_class=Config):
    frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
    app = Flask(
        __name__,
        static_folder=str(frontend_dist / "assets"),
        static_url_path="/assets",
    )
    app.config.from_object(config_class)
    app.config["UPLOAD_FOLDER"] = Path(app.config["UPLOAD_FOLDER"])
    app.config["UPLOAD_FOLDER"].mkdir(parents=True, exist_ok=True)

    logging.basicConfig(level=logging.INFO)
    CORS(app, resources={r"/api/*": {"origins": app.config["FRONTEND_ORIGIN"]}})

    def open_database():
        mongo_database = database.get_connection(app.config)
        database.ensure_schema(mongo_database)
        return mongo_database

    def valid_id(value):
        return bool(ID_PATTERN.fullmatch(value or ""))

    def log_database_unavailable():
        app.logger.exception("MongoDB operation failed")

    @app.errorhandler(RequestEntityTooLarge)
    def request_too_large(_error):
        return jsonify({"error": "Audio files must be smaller than 50 MB."}), 413

    @app.get("/")
    def index():
        index_file = frontend_dist / "index.html"
        if not index_file.is_file():
            return jsonify({
                "error": "Frontend build not found. Run npm run build in the frontend folder.",
            }), 503
        return send_from_directory(frontend_dist, "index.html")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "SpeechAI API"})

    @app.post("/api/transcribe")
    def transcribe():
        if "file" not in request.files:
            return jsonify({"error": "Choose an audio file to continue."}), 400

        uploaded_file = request.files["file"]
        if not uploaded_file.filename:
            return jsonify({"error": "Choose an audio file to continue."}), 400

        original_name = secure_filename(uploaded_file.filename)
        extension = Path(original_name).suffix.lower()
        if not original_name or extension not in ALLOWED_EXTENSIONS:
            return jsonify({"error": "This audio format is not supported."}), 400

        temporary_path = None
        try:
            with tempfile.NamedTemporaryFile(
                suffix=extension,
                dir=app.config["UPLOAD_FOLDER"],
                delete=False,
            ) as temporary_file:
                temporary_path = Path(temporary_file.name)
                uploaded_file.save(temporary_file)

            if temporary_path.stat().st_size == 0:
                return jsonify({"error": "The selected audio file is empty."}), 400

            transcript, language = transcribe_audio(
                temporary_path,
                app.config["WHISPER_MODEL"],
            )
            if not transcript:
                return jsonify({"error": "No speech was detected in this audio."}), 422

            analysis = analyze_text(transcript)
            result_id = None
            saved = False
            try:
                mongo_database = open_database()
            except database.Error:
                log_database_unavailable()
            else:
                try:
                    result_id = database.save_analysis(
                        mongo_database,
                        original_name,
                        transcript,
                        language,
                        analysis,
                    )
                    saved = True
                except database.Error:
                    log_database_unavailable()

            return jsonify({
                "id": result_id,
                "audio_filename": original_name,
                "transcript": transcript,
                "language": language,
                "analysis": analysis,
                "saved": saved,
                "status": "completed",
            }), 201
        except Exception:
            app.logger.exception("Audio processing failed")
            return jsonify({
                "error": "Unable to process this audio. Please try again.",
            }), 500
        finally:
            if temporary_path is not None:
                temporary_path.unlink(missing_ok=True)

    @app.post("/api/analyze")
    def analyze():
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return jsonify({"error": "Provide transcript text to analyze."}), 400
        transcript = payload.get("transcript")
        if not isinstance(transcript, str) or not transcript.strip():
            return jsonify({"error": "Transcript text is required."}), 400
        if len(transcript) > 100_000:
            return jsonify({"error": "Transcript text must be 100,000 characters or fewer."}), 400

        audio_filename = payload.get("audio_filename", "Manual transcript")
        if not isinstance(audio_filename, str):
            return jsonify({"error": "Audio filename must be text."}), 400
        audio_filename = secure_filename(audio_filename.strip())[:255] or "Manual transcript"
        language = payload.get("language", "unknown")
        if not isinstance(language, str) or len(language) > 32:
            return jsonify({"error": "Language must be 32 characters or fewer."}), 400

        try:
            analysis = analyze_text(transcript)
            result_id = None
            saved = False
            try:
                mongo_database = open_database()
            except database.Error:
                log_database_unavailable()
            else:
                try:
                    result_id = database.save_analysis(
                        mongo_database,
                        audio_filename,
                        transcript,
                        language,
                        analysis,
                    )
                    saved = True
                except database.Error:
                    log_database_unavailable()
            return jsonify({"id": result_id, "analysis": analysis, "saved": saved}), 201
        except Exception:
            app.logger.exception("Transcript analysis failed")
            return jsonify({"error": "Unable to analyze this transcript. Please try again."}), 500

    @app.get("/api/history")
    def history():
        try:
            mongo_database = open_database()
            results = database.list_analyses(mongo_database)
            return jsonify({"history": results})
        except Exception:
            app.logger.exception("History could not be loaded")
            return jsonify({"error": "History is temporarily unavailable."}), 503

    @app.get("/api/history/<analysis_id>")
    def history_item(analysis_id):
        if not valid_id(analysis_id):
            return jsonify({"error": "Analysis not found."}), 404
        try:
            mongo_database = open_database()
            result = database.get_analysis(mongo_database, analysis_id)
            if result is None:
                return jsonify({"error": "Analysis not found."}), 404
            return jsonify({"result": result})
        except Exception:
            app.logger.exception("Analysis could not be loaded")
            return jsonify({"error": "This analysis is temporarily unavailable."}), 503

    @app.delete("/api/history/<analysis_id>")
    def delete_history_item(analysis_id):
        if not valid_id(analysis_id):
            return jsonify({"error": "Analysis not found."}), 404
        try:
            mongo_database = open_database()
            deleted = database.delete_analysis(mongo_database, analysis_id)
            if not deleted:
                return jsonify({"error": "Analysis not found."}), 404
            return jsonify({"status": "deleted"})
        except Exception:
            app.logger.exception("Analysis could not be deleted")
            return jsonify({"error": "This analysis could not be deleted. Please try again."}), 503

    return app


app = create_app()


if __name__ == "__main__":
    app.run(port=5000)
