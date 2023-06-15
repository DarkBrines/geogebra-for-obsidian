import { App, Plugin, PluginSettingTab, Setting } from 'obsidian'
import { GeoGebraView, GEOGEBRA_VIEW_TYPE } from "./gview"
import { GeoGebraServer } from './ggbserver'

// Remember to rename these classes and interfaces!

export interface GeoGebraSettings {
	applet: string,
	offline: boolean
}

const DEFAULT_SETTINGS: GeoGebraSettings = {
	applet: "graphing",
	offline: false
}

export default class GeoGebraPlugin extends Plugin {
	settings: GeoGebraSettings
	ggbServer: GeoGebraServer

	async onload() {
		await this.loadSettings()
		this.addSettingTab(new GeoGebraSettingTab(this.app, this))

		this.ggbServer = new GeoGebraServer()
		this.ggbServer.start()

		this.registerView(
			GEOGEBRA_VIEW_TYPE,
			(leaf) => new GeoGebraView(leaf, `http://localhost:${this.ggbServer.port}/holder.html`, this.settings)
		)

		this.registerExtensions(["ggb", "ggs"], GEOGEBRA_VIEW_TYPE)
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}
}

class GeoGebraSettingTab extends PluginSettingTab {
	plugin: GeoGebraPlugin

	constructor(app: App, plugin: GeoGebraPlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const { containerEl } = this

		containerEl.empty()

		containerEl.createEl('h2', { text: 'Defaults' })

		new Setting(containerEl)
			.setName("Applet")
			.setDesc("Set the default GeoGebra applet.")
			.addDropdown(drpdown => drpdown
				.addOptions({
					"graphing": "Graphical Calculator",
					"geometry": "Geometry",
					"3d": "3D Graphing Calculator",
					"classic": "Classic",
					"suite": "Calculator Suite",
					"evaluator": "Equation Editor",
					"scientific": "Scientific Calculator",
					"notes": "Notes"
				})

				.setValue(this.plugin.settings.applet)
				.onChange(async value => {
					this.plugin.settings.applet = value
					await this.plugin.saveSettings()
				}))

		containerEl.createEl('h2', { text: 'Geogebra origin' })
		new Setting(containerEl)
			.setName("Offline mode")
			.setDesc("If on, Geogebra webkit will be downloaded in your vault instead of reached online everytime you open GeoGebra.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.offline)
				.onChange(async value => {
					this.plugin.settings.offline = value
					await this.plugin.saveSettings()
				}))

	}
}
