import { useEffect } from "react";

export function useDocumentMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    const setMeta = (name: string, content: string, isProperty = false) => {
      const sel = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.head.querySelector<HTMLMetaElement>(sel);
      if (!el) {
        el = document.createElement("meta");
        if (isProperty) el.setAttribute("property", name);
        else el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta(
      "og:image",
      "https://storage.googleapis.com/gpt-engineer-file-uploads/BcFKzrkAAgeXCIIc3OqGfkKtWSA3/social-images/social-1779562911044-IMG_1649.webp",
      true
    );
  }, [title, description]);
}
