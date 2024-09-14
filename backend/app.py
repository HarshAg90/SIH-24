import os
import zipfile
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Helper function to extract files from a zip archive
def extract_files_from_zip(zip_file, extract_folder):
    with zipfile.ZipFile(zip_file, 'r') as zip_ref:
        zip_ref.extractall(extract_folder)

# Helper function to search for files inside the extracted folder
def find_file_in_extracted_folder(folder_path, file_name):
    for root, dirs, files in os.walk(folder_path):
        if file_name in files:
            return os.path.join(root, file_name)
    return None

# Function to handle file processing
def parse_package_lock(package_lock_path, package_audit_path):
    # Add your parsing logic here (dummy example)
    with open(package_lock_path, 'r') as lock_file:
        package_lock_data = json.load(lock_file)
    with open(package_audit_path, 'r') as audit_file:
        package_audit_data = json.load(audit_file)

    # For now, let's just return a dummy parsed result
    return {
        "package_lock": package_lock_data,
        "package_audit": package_audit_data
    }

# Route to handle zip file upload and process package_lock.json and package_audit.json
@app.route('/js/npm-parser', methods=['POST'])
def npm_parser():
    try:
        uploaded_zip_file = request.files['zip_file']

        if uploaded_zip_file:
            zip_file_path = f"uploads/{uploaded_zip_file.filename}"
            extract_folder = "uploads/extracted_files"
            os.makedirs(extract_folder, exist_ok=True)

            # Save the zip file
            uploaded_zip_file.save(zip_file_path)

            # Extract the zip file
            extract_files_from_zip(zip_file_path, extract_folder)

            # Search for package_lock.json and package_audit.json inside the extracted folder
            package_lock_path = find_file_in_extracted_folder(
                extract_folder, "package_lock.json")
            package_audit_path = find_file_in_extracted_folder(
                extract_folder, "package_audit.json")

            # Check if both files are found
            if not package_lock_path or not package_audit_path:
                return jsonify({"error": "Required files (package_lock.json or package_audit.json) not found in the zip."}), 400

            # Process the files
            parsed_data = parse_package_lock(package_lock_path, package_audit_path)

            # Clean up extracted files and zip file
            os.remove(zip_file_path)
            for root, dirs, files in os.walk(extract_folder):
                for file in files:
                    os.remove(os.path.join(root, file))
                os.rmdir(root)

            # Return the processed data
            json_string = json.dumps(parsed_data, separators=(",", ":"), sort_keys=False, ensure_ascii=False)
            return jsonify(json_string), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
