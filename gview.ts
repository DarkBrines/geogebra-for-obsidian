import { GeoGebraSettings } from "main"
import { FileView, TFile, WorkspaceLeaf } from "obsidian"

export const GEOGEBRA_VIEW_TYPE = "geogebra-view"

export class GeoGebraView extends FileView {
  title: string
  url: string
  frame: HTMLIFrameElement
  settings: GeoGebraSettings

  constructor(leaf: WorkspaceLeaf, url: string, settings: GeoGebraSettings) {
    super(leaf)
    this.url = url
    this.settings = settings
  }

  getViewType() {
    return GEOGEBRA_VIEW_TYPE
  }

  getDisplayText() {
    return this.title
  }

  getIcon(): string {
    return "line-chart"
  }

  transferConfig() {
    this.frame.contentWindow?.postMessage("cfig:" + [
      this.settings.applet
    ].join(";"), "*")
  }

  transferFile() {
    this.file.vault.readBinary(this.file).then(content => {
      if (!content) return
      let encoded = Buffer.from(content).toString("base64")

      this.frame.contentWindow?.postMessage("file:" + encoded, "*")
    })
  }

  async onLoadFile(file: TFile) {
    const uFilename = file.name.split(".")
    this.title = uFilename[0]

    if (file.extension == "ggb" && ["graphing", "geometry", "3d", "classic", "suite", "evaluator", "scientific"].includes(uFilename[1])) {
      this.settings.applet = uFilename[1]
    } else if (file.extension == "ggs") {
      this.settings.applet = "notes"
    }

    let frame: HTMLIFrameElement = document.createElement("iframe")
    frame.src = this.url
    frame.style.height = "100%"
    frame.style.width = "100%"
    this.contentEl.appendChild(frame)

    this.frame = frame

    console.log("onLoadFile fired")
  }

  async onUnloadFile(file: TFile) {
    this.contentEl.firstChild?.remove()
    console.log("onUnloadFile fired")
  }

  async onOpen() {
    this.registerDomEvent(window, "message", ev => {
      if (!ev.data || typeof ev.data != "string" || ev.data.length < 5) return;
      switch (ev.data.substring(0, 5)) {
        case "redy:": //Ready
          this.transferConfig()
          break;

        case "frqt:": //File request
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
    console.log("onClose fired")
  }
}