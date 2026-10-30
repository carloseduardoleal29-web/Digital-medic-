with open('src/components/ProgressiveRecipeWizard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

bad_str = '<Sparkles className="w-{/* Sticky Top Bar: Navegación y Pasos rápidos */}'
if bad_str in text:
    p_bad = text.find(bad_str)
    p_div = text.rfind('<div className="flex items-center justify-between', 0, p_bad)
    if p_div == -1:
        p_div = text.rfind('<div className="bg-white', 0, p_bad)
    p_good = text.find('{/* Sticky Top Bar: Navegación y Pasos rápidos */}', p_bad)
    if p_good != -1:
        text = text[:p_div] + text[p_good:]
        with open('src/components/ProgressiveRecipeWizard.tsx', 'w', encoding='utf-8') as f:
            f.write(text)
        print("Cleaned ProgressiveRecipeWizard syntax error.")
else:
    print("bad_str not found, searching with regex...")
    import re
    m = re.search(r'<Sparkles className="w-\{/\* Sticky Top Bar.*?(?=\{/\* Sticky Top Bar)', text, re.DOTALL)
    if m:
        text = text[:m.start()] + text[m.end():]
        with open('src/components/ProgressiveRecipeWizard.tsx', 'w', encoding='utf-8') as f:
            f.write(text)
        print("Regex cleaned bad sparkles line.")
