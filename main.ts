import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { GeoGebraView, GEOGEBRA_VIEW_TYPE } from "./gview";

// Remember to rename these classes and interfaces!

interface GeoGebraSettings {
	defaults: {
		applet: string
	}
}

const DEFAULT_SETTINGS: GeoGebraSettings = {
	defaults: {
		applet: "graphing"
	}
}

export default class MyPlugin extends Plugin {
	settings: GeoGebraSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new GeoGebraSettingTab(this.app, this));

		this.registerView(
			GEOGEBRA_VIEW_TYPE,
			(leaf) => new GeoGebraView(leaf)
		);

		this.registerExtensions(["ggb"], GEOGEBRA_VIEW_TYPE)
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class GeoGebraSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Defaults'});

		new Setting(containerEl)
			.setName("Applet")
			.setDesc("Set the default GeoGebra applet.")
			.addDropdown(drpdown => drpdown
				.addOptions({
					"graphing": "Graphical Calculator",
					"geometry": "Geometry",
					"3D": "Geometry 3D",
					"classic": "Classic"
				})

				.setValue(this.plugin.settings.defaults.applet)
				.onChange(async value => {
					this.plugin.settings.defaults.applet = value
					await this.plugin.saveSettings()
				}))
	}
}
