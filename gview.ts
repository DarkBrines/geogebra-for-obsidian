import GeoGebraPlugin from "main"
import { FileView, TFile, WorkspaceLeaf } from "obsidian"

export const GEOGEBRA_VIEW_TYPE = "geogebra-view"

export class GeoGebraView extends FileView {
  title: string
  url: string
  frame: HTMLIFrameElement

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

  transferFile() {
    this.file.vault.readBinary(this.file).then(content => {
      if (!content) return
      let encoded = Buffer.from(content).toString("base64")

      this.frame.contentWindow?.postMessage("file:" + encoded, "*")
    })
  }

  async onLoadFile(file: TFile) {
    this.title = file.basename

    let frame: HTMLIFrameElement = document.createElement("iframe")
    frame.src = this.url
    frame.style.height = "100%"
    frame.style.width = "100%"
    this.contentEl.appendChild(frame)

    this.frame = frame
  }

  async onUnloadFile(file: TFile) {
    this.contentEl.firstChild?.remove()
  }

  async onOpen() {
    document.querySelector("div.status-bar")?.addClass("hidden-status-bar")

    this.registerDomEvent(window, "message", ev => {
      console.log(ev)
      if (!ev.data || typeof ev.data != "string" || ev.data.length < 5) return;
      switch (ev.data.substring(0, 5)) {
        case "redy:":
          this.transferFile()
          break;

        default:
          console.warn("Received invalid message")
          break;
      }
    })

    this.contentEl.style.padding = "0"
    this.contentEl.style.overflow = "hidden"

    console.log(this)
  }

  async onClose() {
    document.querySelector("div.status-bar")?.removeClass("hidden-status-bar")
  }
}