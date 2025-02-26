import store, { RootState } from "@/store"
import { ComponentNode } from "@/redux/currentApp/editor/components/componentsState"
import { createSelector } from "@reduxjs/toolkit"
import { getSelectedComponents } from "@/redux/config/configSelector"

export function searchDSLByDisplayName(
  displayName: string,
  rootState: RootState = store.getState(),
) {
  const rootNode = getCanvas(rootState)
  return searchDsl(rootNode, displayName)
}

export function searchDsl(
  rootNode: ComponentNode | null,
  findDisplayName: string | null,
): ComponentNode | null {
  if (rootNode == null || findDisplayName == null) {
    return null
  }
  const queue = [rootNode]
  while (queue.length > 0) {
    const head = queue[queue.length - 1]

    if (head.displayName == findDisplayName) {
      return head
    }
    queue.pop()
    if (head.childrenNode) {
      head.childrenNode.forEach((child) => {
        if (child) {
          queue.push(child)
        }
      })
    }
  }
  return null
}

export function flattenDslToMap(rootNode: ComponentNode): {
  [key: string]: ComponentNode
} {
  const queue = [rootNode]
  let res = {}
  while (queue.length > 0) {
    const head = queue[queue.length - 1]

    if (head.containerType !== "EDITOR_DOT_PANEL") {
      res = { ...res, [head.displayName]: head || {} }
    }
    queue.pop()
    if (head.childrenNode) {
      head.childrenNode.forEach((child) => {
        if (child) {
          queue.push(child)
        }
      })
    }
  }
  return res
}

export function flattenDslToArray(rootNode: ComponentNode): ComponentNode[] {
  const queue = [rootNode]
  let res: ComponentNode[] = []
  while (queue.length > 0) {
    const head = queue[queue.length - 1]

    if (head.containerType !== "EDITOR_DOT_PANEL") {
      res.push(head)
    }
    queue.pop()
    if (head.childrenNode) {
      head.childrenNode.forEach((child) => {
        if (child) {
          queue.push(child)
        }
      })
    }
  }
  return res
}

export const getCanvas = (state: RootState) => {
  return state.currentApp.editor.components
}

export const getComponentNodeBySingleSelected = createSelector(
  [getCanvas, getSelectedComponents],
  (rootDsl, selectedComponentDisplayNames) => {
    if (selectedComponentDisplayNames.length === 1) {
      return searchDsl(rootDsl, selectedComponentDisplayNames[0])
    }
    return null
  },
)

export const getAllComponentDisplayNameMapProps = createSelector(
  [getCanvas],
  (rootDSL) => {
    if (rootDSL == null) {
      return null
    }
    const components = flattenDslToMap(rootDSL)
    if (!components) return
    const res: Record<string, any> = {}
    Object.keys(components).forEach((key) => {
      res[key] = {
        ...components[key].props,
        $type: "WIDGET",
        $widgetType: components[key].type,
      }
    })
    return res
  },
)

export const getAllContainerWidget = createSelector([getCanvas], (rootDSL) => {
  if (rootDSL == null) {
    return null
  }
  const components = flattenDslToMap(rootDSL)
  if (!components) return
  const res: Record<string, any> = {}
  Object.keys(components).forEach((key) => {
    if (components[key].type === "CONTAINER_WIDGET") {
      res[key] = {
        ...components[key].props,
        $type: "WIDGET",
        $widgetType: components[key].type,
      }
    }
  })
  return res
})

export const getFlattenArrayComponentNodes = createSelector(
  [getCanvas],
  (rootDSL) => {
    if (rootDSL == null) {
      return null
    }
    const components = flattenDslToArray(rootDSL)
    return components || []
  },
)
