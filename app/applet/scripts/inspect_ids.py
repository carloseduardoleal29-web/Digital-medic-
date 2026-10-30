import re

# 1. Inspect MedicalRestModule IDs
with open('src/components/MedicalRestModule.tsx') as f:
    text_rest = f.read()
print('Rest IDs:', re.findall(r'id=[\'"][^\'"]+[\'"]', text_rest))

# 2. Inspect ReportsModule IDs
with open('src/components/ReportsModule.tsx') as f:
    text_rep = f.read()
print('Report IDs:', re.findall(r'id=[\'"][^\'"]+[\'"]', text_rep))
