import { ReactComponent as EditableTextWidgetIcon } from "@/assets/widgetCover/editableText.svg"
import { WidgetConfig } from "@/widgetLibrary/interface"
import i18n from "@/i18n/config"

export const EDITABLE_TEXT_WIDGET_CONFIG: WidgetConfig = {
  type: "EDITABLE_TEXT_WIDGET",
  displayName: "editable_text",
  widgetName: i18n.t("widget.editable_text.name"),
  icon: <EditableTextWidgetIcon />,
  keywords: ["Editable Text", "可编辑文本"],
  sessionType: "INPUTS",
  w: 24,
  h: 5,
  defaults: {
    label: "Label",
    labelAlign: "left",
    labelPosition: "left",
    labelWidth: "{{33}}",
    colorScheme: "blue",
    hidden: false,
    value: "editable text for display",
  },
}
