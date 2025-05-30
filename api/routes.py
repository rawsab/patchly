from fastapi import APIRouter
from pydantic import BaseModel
from api.utils.repo_manager import RepoManager
from api.scanner_router import ScannerRouter
from api.utils.cve_parser import CVEParser

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
    try:
        repo_path = manager.clone_repo(request.repo_url)
        language, manifest_path = manager.detect_language(repo_path)
        if language == "unknown" or not manifest_path:
            return {
                "repo_url": request.repo_url,
                "language": language,
                "scan_results": None,
                "error": {
                    "type": "LanguageDetectionError",
                    "message": "Unsupported or undetected language.",
                    "step": "language_detection"
                }
            }
        scan_results = scanner.run_scan(manifest_path, language)
        normalized_results = parser.normalize(scan_results)
        return {
            "repo_url": request.repo_url,
            "language": language,
            "scan_results": normalized_results
        }
    except Exception as e:
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

