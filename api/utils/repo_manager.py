import os
import tempfile
import subprocess
import logging
from urllib.parse import urlparse
from typing import Tuple, Optional
from glob import glob

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RepoManager:
    def clone_repo(self, github_url: str):
        # must be a GitHub URL
        parsed = urlparse(github_url)
        if not (parsed.scheme in ("http", "https") and parsed.netloc == "github.com"):
            raise ValueError("Only public GitHub URLs are supported.")

        temp_dir = tempfile.mkdtemp(prefix="repo_clone_")
        repo_name = os.path.splitext(os.path.basename(parsed.path))[0]
        dest_path = os.path.join(temp_dir, repo_name)

        try:
            logger.info(f"Cloning repository: {github_url}")
            result = subprocess.run([
                "git", "clone", "--depth", "1", github_url, dest_path
            ], check=True, capture_output=True, text=True)
            logger.info(f"Repository cloned successfully to: {dest_path}")
            return dest_path
        except subprocess.CalledProcessError as e:
            logger.error(f"Git clone failed: {e.stderr}")
            raise RuntimeError(f"Git clone failed: {e.stderr}")

    def detect_language(self, repo_path: str) -> Tuple[str, Optional[str]]:
        if not os.path.exists(repo_path):
            logger.error(f"Repository path does not exist: {repo_path}")
            return "unknown", None

        logger.info(f"Detecting language for repository: {repo_path}")
        
        # Check root and first-level subdirectories for manifest files
        candidates = [repo_path]
        try:
            candidates.extend([
                os.path.join(repo_path, d) 
                for d in os.listdir(repo_path) 
                if os.path.isdir(os.path.join(repo_path, d))
            ])
        except Exception as e:
            logger.error(f"Error reading repository directory: {e}")
            return "unknown", None

        # Python
        for path in candidates:
            for fname in ["requirements.txt", "pyproject.toml", "setup.py"]:
                manifest = os.path.join(path, fname)
                if os.path.isfile(manifest):
                    logger.info(f"Detected Python project with {fname}")
                    return "python", path

        # Node.js
        for path in candidates:
            manifest = os.path.join(path, "package.json")
            if os.path.isfile(manifest):
                logger.info("Detected Node.js project")
                return "nodejs", path

        # OSV-Scanner supported manifests
        osv_patterns = [
            "go.mod", "go.sum", "pom.xml", "build.gradle", "build.gradle.kts", 
            "settings.gradle", "settings.gradle.kts", "Cargo.lock", "Gemfile.lock", 
            "composer.lock", "pubspec.lock", "Pipfile.lock", "poetry.lock",
            "yarn.lock", "pnpm-lock.yaml", "package-lock.json",
            "*.csproj", "*.fsproj", "*.vbproj", "packages.config", 
            "mix.lock", "shard.lock", "conan.lock", "requirements.txt"
        ]
        
        for path in candidates:
            for pattern in osv_patterns:
                try:
                    for file in glob(os.path.join(path, pattern)):
                        logger.info(f"Detected OSV project with {pattern}")
                        return "osv", path
                except Exception as e:
                    logger.error(f"Error checking pattern {pattern}: {e}")
                    continue

        logger.warning("No supported language detected")
        return "unknown", None
