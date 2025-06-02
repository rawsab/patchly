from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from api.utils.repo_manager import RepoManager
from api.scanner_router import ScannerRouter
from api.utils.cve_parser import CVEParser
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class ScanRequest(BaseModel):
    repo_url: str

@router.get("/health")
def health_check():
    return {"status": "ok"}

@router.post("/scan")
def scan_repo(request: ScanRequest):
    manager = RepoManager()
    scanner = ScannerRouter()
    parser = CVEParser()
    language = None
    repo_path = None

    try:
        logger.info(f"Starting scan for repository: {request.repo_url}")
        repo_path = manager.clone_repo(request.repo_url)
        language, manifest_path = manager.detect_language(repo_path)

        if language == "unknown" or not manifest_path:
            logger.warning(f"Unsupported or undetected language for {request.repo_url}")
            return {
                "repo_url": request.repo_url,
                "language": language,
                "scan_results": None,
                "error": {
                    "type": "LanguageDetectionError",
                    "message": "Unsupported or undetected language. Please ensure the repository contains a supported manifest file (e.g., requirements.txt, package.json).",
                    "step": "language_detection"
                }
            }

        logger.info(f"Running scan for {language} project")
        scan_results = scanner.run_scan(manifest_path, language)
        normalized_results = parser.normalize(scan_results)

        return {
            "repo_url": request.repo_url,
            "language": language,
            "scan_results": normalized_results
        }

    except Exception as e:
        logger.error(f"Error during scan: {str(e)}")
        return {
            "repo_url": request.repo_url,
            "language": language,
            "scan_results": None,
            "error": {
                "type": e.__class__.__name__,
                "message": str(e),
                "step": "scanning"
            }
        }

