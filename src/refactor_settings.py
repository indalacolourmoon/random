import os
import re

def refactor():
    src_dir = r"d:\mohan\IJITEST\src"
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith((".ts", ".tsx")):
                # Skip core files we already handled or that shouldn't be touched
                if file in ["settings.ts", "useSettings.ts"]:
                    continue
                
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                changed = False
                
                # Update imports from getSettings to getSettingsData
                if "getSettings" in content and "actions/settings" in content:
                    # Replace in destructuring: { ..., getSettings, ... }
                    content = re.sub(r"{(.*)getSettings(.*)}\s+from\s+['\"]@/actions/settings['\"]", 
                                   r"{\1getSettingsData\2} from '@/actions/settings'", content)
                    # Simple import
                    content = re.sub(r"import\s+{\s*getSettings\s*}\s+from\s+['\"]@/actions/settings['\"]", 
                                   "import { getSettingsData } from '@/actions/settings'", content)
                    changed = True
                
                # Replace calls: getSettings() -> getSettingsData()
                if "getSettingsData" in content and "getSettings()" in content:
                    content = content.replace("getSettings()", "getSettingsData()")
                    changed = True
                    
                if changed:
                    print(f"Updated {path}")
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(content)

if __name__ == "__main__":
    refactor()
