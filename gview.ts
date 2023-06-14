import { FileView, TFile, WorkspaceLeaf } from "obsidian"

export const GEOGEBRA_VIEW_TYPE = "geogebra-view"

export class GeoGebraView extends FileView {
  title: string
  url: string

  constructor(leaf: WorkspaceLeaf, url: string) {
    super(leaf)
    this.url = url
  }

  getViewType() {
    return GEOGEBRA_VIEW_TYPE
  }

  getDisplayText() {
    return this.title
  }

  async onLoadFile(file: TFile) {
    this.title = file.basename
  }

  async onOpen() {
    document.querySelector("div.status-bar")?.addClass("hidden-status-bar")

    this.contentEl.style.padding = "0"
    this.contentEl.style.overflow = "hidden"

    let el: HTMLIFrameElement = document.createElement("iframe")
    el.src = this.url
    el.style.height = "100%"
    el.style.width = "100%"
    this.contentEl.appendChild(el)

    console.log(this)
  }

  async onClose() {
    document.querySelector("div.status-bar")?.removeClass("hidden-status-bar")
  }
}