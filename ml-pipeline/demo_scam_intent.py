from scam_intent_detection import detect_scam_intent
result = detect_scam_intent("Please share the OTP sent to your phone urgently")
print(result["flagged_categories"])