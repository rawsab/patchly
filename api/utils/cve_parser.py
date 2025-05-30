class CVEParser:
    def normalize(self, scanner_output):
        # handle pip-audit output
        if isinstance(scanner_output, dict) and "dependencies" in scanner_output:
            packages = scanner_output["dependencies"]
            normalized = []
            for pkg in packages:
                name = pkg.get("name")
                version = pkg.get("version")
                for vuln in pkg.get("vulns", []):
                    normalized.append({
                        "cve_id": vuln.get("id"),
                        "package": name,
                        "version": version,
                        "severity": vuln.get("severity", "UNKNOWN"),
                        "description": vuln.get("description", ""),
                        "references": vuln.get("references", []),
                        "aliases": vuln.get("aliases", []),
                        "fix_versions": vuln.get("fix_versions", [])
                    })
            return normalized
        # handle npm audit output
        elif isinstance(scanner_output, dict) and "vulnerabilities" in scanner_output:
            vulns = scanner_output["vulnerabilities"]
            normalized = []
            for pkg_name, vuln_info in vulns.items():
                version = None
                if "nodes" in vuln_info and vuln_info["nodes"]:
                    # try to extract version from node_modules path if possible
                    # (not always available)
                    version = None
                via = vuln_info.get("via", [])
                if isinstance(via, dict):
                    via = [via]
                for v in via:
                    if isinstance(v, dict):
                        normalized.append({
                            "cve_id": v.get("source", v.get("title", "")),
                            "package": pkg_name,
                            "version": version,
                            "severity": v.get("severity", vuln_info.get("severity", "UNKNOWN")),
                            "description": v.get("title", v.get("name", "")),
                            "references": [v.get("url")] if v.get("url") else [],
                            "aliases": [],
                            "fix_versions": [v.get("fixAvailable", {}).get("version")] if isinstance(v.get("fixAvailable"), dict) and v.get("fixAvailable", {}).get("version") else []
                        })
            return normalized
        # handle old pip-audit output (list)
        elif isinstance(scanner_output, list):
            packages = scanner_output
            normalized = []
            for pkg in packages:
                name = pkg.get("name")
                version = pkg.get("version")
                for vuln in pkg.get("vulns", []):
                    normalized.append({
                        "cve_id": vuln.get("id"),
                        "package": name,
                        "version": version,
                        "severity": vuln.get("severity", "UNKNOWN"),
                        "description": vuln.get("description", ""),
                        "references": vuln.get("references", []),
                        "aliases": vuln.get("aliases", []),
                        "fix_versions": vuln.get("fix_versions", [])
                    })
            return normalized
        else:
            return []
