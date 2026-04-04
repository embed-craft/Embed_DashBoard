import sys, re

def clean_file(path, is_design_step=False):
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()

    if is_design_step:
        imports = ["CustomHtmlEditor", "CheckboxEditor", "RatingEditor", "ProgressCircleEditor", "ListEditor", "BadgeEditor"]
        for imp in imports:
            text = re.sub(r'import\s+\{\s*' + imp + r'\s*\}\s*from\s*[^\n]+\n', '', text)

        blocks = ["custom_html", "progress-circle", "list", "checkbox", "rating", "badge", "handle"]
        for b in blocks:
            # Match the if blocks containing return <Editor />
            pattern = re.compile(r"(\s*)if\s*\(selectedLayerObj\.type\s*===\s*'" + b + r"'\)\s*\{.*?return.*?;.*?\n\1\}\n", re.DOTALL)
            text = re.sub(pattern, "", text)
            
            # The handle block has longer logic not just return, match its bounds roughly if previous failed
            if b == 'handle':
                pattern2 = re.compile(r"(\s*)if\s*\(selectedLayerObj\.type\s*===\s*'handle'\)\s*\{.*?\n\1\}\n", re.DOTALL)
                text = re.sub(pattern2, "", text)

        # Remove from menu: { id: 'custom_html', ... }
        for mi in blocks:
            text = re.sub(r"[ \t]*\{\s*id:\s*'" + mi + r"'.*?\n", "", text)

    else:
        blocks = ["custom_html", "progress-circle", "list", "checkbox", "rating", "badge", "handle"]
        for mi in blocks:
            # Using positive lookahead for next case or default
            pattern = re.compile(r"[ \t]*case\s+'" + mi + r"':.*?(?=[ \t]*case\s+'|[ \t]*default:|\}\s*// end switch)", re.DOTALL)
            text = re.sub(pattern, "", text)

    with open(path, "w", encoding="utf-8") as f:
        f.write(text)

try:
    clean_file("src/components/campaign/steps/DesignStep.tsx", True)
    clean_file("src/components/FloaterRenderer.tsx", False)
    clean_file("src/components/PipRenderer.tsx", False)
    print("Cleaned successfully.")
except Exception as e:
    print(f"Error: {e}")
