import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from stages.scam_intent_detection import detect_scam_intent
result = detect_scam_intent("Please share the OTP sent to your phone urgently")
print(result["flagged_categories"])
