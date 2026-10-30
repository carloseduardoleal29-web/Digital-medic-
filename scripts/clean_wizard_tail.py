with open('src/components/ProgressiveRecipeWizard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = 'export default ProgressiveRecipeWizard;'
idx = text.find(target)

if idx != -1:
    clean_text = text[:idx + len(target)] + '\n'
    with open('src/components/ProgressiveRecipeWizard.tsx', 'w', encoding='utf-8') as f:
        f.write(clean_text)
    print("SUCCESS: Truncated ProgressiveRecipeWizard.tsx after export default.")
else:
    print("ERROR: export default ProgressiveRecipeWizard; not found.")
