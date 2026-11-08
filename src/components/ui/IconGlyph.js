import { iconGlyph, iconTile } from "@/lib/uiClassNames";

/**
 * Decorative icon wrapper — pairs with ChromaticIcons gradient (fc-icon class).
 */
export default function IconGlyph({
  as: Tag = "span",
  tile = false,
  className = "",
  ...props
}) {
  return <Tag className={`${tile ? iconTile : iconGlyph} ${className}`.trim()} {...props} />;
}
