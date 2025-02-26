import store from "@/store"
import { getActionItemByDisplayName } from "@/redux/currentApp/action/actionSelector"
import { runAction } from "@/page/App/components/Actions/ActionPanel/utils/runAction"
import { isDynamicString } from "@/utils/evaluateDynamicString/utils"
import { evaluateDynamicString } from "@/utils/evaluateDynamicString"
import { Message } from "@illa-design/message"
import {
  goToURL,
  showNotification,
} from "@/page/App/context/globalDataProvider"
import { get } from "lodash"

export const transformEvents = (
  event: any,
  globalData: Record<string, any>,
) => {
  if (!event) return
  const { actionType } = event
  if (actionType === "openUrl") {
    const { newTab, url, enabled } = event
    const params = { url, newTab }
    return {
      script: () => {
        goToURL(params)
      },
      enabled,
    }
  }
  if (actionType === "showNotification") {
    const { title, description, notificationType, duration, enabled } = event
    const params = {
      type: notificationType,
      title,
      description,
      duration,
    }
    return {
      script: () => {
        showNotification(params)
      },
      enabled,
    }
  }
  if (actionType === "widget") {
    const { widgetID, widgetMethod, enabled } = event
    if (
      ["setValue", "setImageUrl", "setStartValue", "setEndValue"].includes(
        widgetMethod,
      )
    ) {
      const { widgetTargetValue } = event
      return {
        script: () => {
          const method = get(globalData, `${widgetID}.${widgetMethod}`, null)
          if (method) {
            method(widgetTargetValue)
          }
        },
        enabled,
      }
    }
    if (
      widgetMethod === "clearValue" ||
      widgetMethod === "toggle" ||
      widgetMethod === "focus" ||
      widgetMethod === "reset"
    ) {
      return {
        script: `{{${widgetID}.${widgetMethod}()}}`,
        enabled,
      }
    }
    if (widgetMethod === "setCurrentViewKey") {
      const { key } = event
      return {
        script: `{{${widgetID}.${widgetMethod}("${key}")}}`,
        enabled,
      }
    }
    if (widgetMethod === "setCurrentViewIndex") {
      const { index } = event
      return {
        script: `{{${widgetID}.${widgetMethod}("${index}")}}`,
        enabled,
      }
    }
    if (widgetMethod === "showNextView") {
      const { showNextViewLoopBack } = event
      return {
        script: `{{${widgetID}.${widgetMethod}(${showNextViewLoopBack})}}`,
        enabled,
      }
    }
    if (widgetMethod === "showPreviousView") {
      const { showPreviousViewLoopBack } = event
      return {
        script: `{{${widgetID}.${widgetMethod}(${showPreviousViewLoopBack})}}`,
        enabled,
      }
    }

    if (widgetMethod === "showNextVisibleView") {
      const { showNextVisibleViewLoopBack } = event
      return {
        script: `{{${widgetID}.${widgetMethod}(${showNextVisibleViewLoopBack})}}`,
        enabled,
      }
    }

    if (widgetMethod === "showPreviousVisibleView") {
      const { showPreviousVisibleViewLoopBack } = event
      return {
        script: `{{${widgetID}.${widgetMethod}(${showPreviousVisibleViewLoopBack})}}`,
        enabled,
      }
    }
    if (widgetMethod === "submit") {
      return {
        script: `{{${widgetID}.${widgetMethod}()}}`,
        enabled,
      }
    }
    if (widgetMethod === "validate") {
      return {
        script: `{{${widgetID}.${widgetMethod}()}}`,
        enabled,
      }
    }
  }
  if (actionType === "datasource") {
    const rootState = store.getState()
    const { queryID, enabled } = event
    const actionItem = getActionItemByDisplayName(rootState, queryID)
    if (!actionItem)
      return {
        script: `{{}}`,
        enabled,
      }
    return {
      script: () => {
        runAction(actionItem)
      },
      enabled,
    }
  }
  return {
    script: `{{}}`,
    enabled: "{{false}}",
  }
}

export const runEventHandler = (
  scriptObj: any,
  globalData: Record<string, any>,
) => {
  const eventObj = transformEvents(scriptObj, globalData)
  if (!eventObj) return
  const { script, enabled } = eventObj
  if (enabled || enabled == undefined) {
    if (typeof script === "string" && isDynamicString(script)) {
      try {
        evaluateDynamicString("events", script, globalData)
      } catch (e) {
        Message.error("eventHandler run error")
      }
      return
    }
    if (typeof script === "function") {
      script()
    }
  }
}
