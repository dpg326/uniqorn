import subprocess
import sys
import os

def rebuild_master():
    """Completely rebuild the master database from scratch."""
    print("🔥 Complete Master Database Rebuild")
    print("=" * 60)
    
    # Delete existing master files
    files_to_delete = [
        "master_bucket_database.json",
        "master_bucket_summary.json"
    ]
    
    for file in files_to_delete:
        if os.path.exists(file):
            os.remove(file)
            print(f"🗑️  Deleted {file}")
        else:
            print(f"⚠️  {file} not found")
    
    # Run master precomputation
    print("\n🚀 Running master precomputation...")
    result = subprocess.run([sys.executable, "master_bucket_precompute.py"], 
                          capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Master precomputation successful!")
        print("\n📊 Now run: python generate_seasonal_uniqorn_index.py")
    else:
        print("❌ Master precomputation failed!")
        print("Error:", result.stderr)

if __name__ == "__main__":
    rebuild_master()
