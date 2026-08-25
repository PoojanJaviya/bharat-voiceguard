from streaming_asr import transcribe_file
result = transcribe_file("testing_audio_files/raj.wav")
print(result["text"])