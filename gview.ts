import { FileView, TFile, WorkspaceLeaf } from "obsidian";

export const GEOGEBRA_VIEW_TYPE = "geogebra-view";

export class GeoGebraView extends FileView {
  title: string

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return GEOGEBRA_VIEW_TYPE;
  }

  getDisplayText() {
    return this.title;
  }

  async onLoadFile(file: TFile) {
      this.title = file.basename
  }

  async onOpen() {
    document.querySelector("div.status-bar")?.addClass("")
  }

  async onClose() {
    // Nothing to clean up.
  }
}