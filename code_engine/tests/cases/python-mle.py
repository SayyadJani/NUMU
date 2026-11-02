# Intentional large memory allocation for MLE testing
try:
    arr = [0] * (1024 * 1024 * 64) # ~512 MB
    print("Allocated")
except MemoryError:
    print("MemoryError caught")
