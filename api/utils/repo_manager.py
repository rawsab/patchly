import os
import tempfile
import subprocess
from urllib.parse import urlparse
from typing import Tuple, Optional
from glob import glob

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
            result = subprocess.run([
                "git", "clone", "--depth", "1", github_url, dest_path
            ], check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"Git clone failed: {e.stderr}")

        return dest_path

    def detect_language(self, repo_path: str) -> Tuple[str, Optional[str]]:
        # Check root and first-level subdirectories for manifest files
        candidates = [repo_path] + [os.path.join(repo_path, d) for d in os.listdir(repo_path) if os.path.isdir(os.path.join(repo_path, d))]
        # Python
        for path in candidates:
            for fname in ["requirements.txt", "pyproject.toml", "setup.py"]:
                manifest = os.path.join(path, fname)
                if os.path.isfile(manifest):
                    return "python", path
        # Node.js
        for path in candidates:
            manifest = os.path.join(path, "package.json")
            if os.path.isfile(manifest):
                return "nodejs", path
        # OSV-Scanner supported manifests
        osv_patterns = [
            "go.mod", "go.sum", "pom.xml", "build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts",
            "Cargo.lock", "Gemfile.lock", "composer.lock", "pubspec.lock", "Pipfile.lock", "poetry.lock",
            "yarn.lock", "pnpm-lock.yaml", "package-lock.json",
            "*.csproj", "*.fsproj", "*.vbproj", "packages.config", "mix.lock", "shard.lock", "conan.lock", "requirements.txt"
        ]
        for path in candidates:
            for pattern in osv_patterns:
                for file in glob(os.path.join(path, pattern)):
                    return "osv", path
        return "unknown", None
