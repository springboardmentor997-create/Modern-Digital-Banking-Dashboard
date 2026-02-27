import time
import requests
import sys
from datetime import datetime

def keep_alive(url, interval=600):
    """
    Pings the URL every 'interval' seconds to prevent it from sleeping.
    Default interval is 600 seconds (10 minutes).
    Render free tier sleeps after 15 minutes of inactivity.
    """
    print(f"🚀 Starting keep-alive monitor for: {url}")
    print(f"⏱️  Pinging every {interval/60} minutes to prevent spin-down...")
    print("Press Ctrl+C to stop.")
    
    while True:
        try:
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            response = requests.get(url)
            
            if response.status_code == 200:
                print(f"[{timestamp}] ✅ Ping successful! Status: 200 OK")
            else:
                print(f"[{timestamp}] ⚠️  Ping returned status: {response.status_code}")
                
        except Exception as e:
            print(f"[{timestamp}] ❌ Error pinging server: {e}")
        
        # Wait for the next interval
        time.sleep(interval)

if __name__ == "__main__":
    # The URL found in your screenshot
    DEFAULT_URL = "https://banking-backend-l4gw.onrender.com/health"
    
    target_url = DEFAULT_URL
    
    # Allow passing a different URL as an argument
    if len(sys.argv) > 1:
        target_url = sys.argv[1]
    
    keep_alive(target_url)
