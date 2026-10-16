#!/usr/bin/env python3
"""
Tickerline — Production ZIP Packaging Script
Creates clean, verified production ZIP archives for Namecheap Shared Hosting & VPS deployment.
"""

import os
import zipfile

def create_complete_deployment_zip():
    output_filename = "tickerline-production-deploy.zip"
    print(f"Creating {output_filename}...")

    # Files and folders to exclude
    exclude_dirs = {"node_modules", ".git", ".aistudio", "__pycache__"}
    exclude_files = {".env", output_filename, "tickerline-cpanel-public_html.zip", "package_zip.py"}

    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk("."):
            # Filter out excluded directories in-place
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith(".cache")]

            for file in files:
                if file in exclude_files:
                    continue
                if file.endswith(".tmp") or file.endswith(".log"):
                    continue

                file_path = os.path.join(root, file)
                # Archive path relative to project root
                archive_name = os.path.relpath(file_path, ".")
                zipf.write(file_path, archive_name)

    size_mb = os.path.getsize(output_filename) / (1024 * 1024)
    print(f"Successfully generated {output_filename} ({size_mb:.2f} MB)")


def create_cpanel_public_html_zip():
    output_filename = "tickerline-cpanel-public_html.zip"
    print(f"Creating {output_filename} (public_html static package)...")

    dist_dir = "dist"
    if not os.path.exists(dist_dir):
        print("Error: dist directory does not exist. Run 'npm run build' first.")
        return

    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                file_path = os.path.join(root, file)
                archive_name = os.path.relpath(file_path, dist_dir)
                zipf.write(file_path, archive_name)

    size_mb = os.path.getsize(output_filename) / (1024 * 1024)
    print(f"Successfully generated {output_filename} ({size_mb:.2f} MB)")


if __name__ == "__main__":
    create_complete_deployment_zip()
    create_cpanel_public_html_zip()
