Vue.component("scan-view-controller", {
	template: `
	<template id = "ScanView">
		<section class = "hero is-fullheight is-light" id = "ScanView">
			<div class = "hero-body">
				<div class = "container has-text-centered">
					<progress class = "progress is-primary is-large" :value = "progress.processed" :max = "progress.total"></progress>
					<p class = "content">Scanning file {{progress.processed}} of {{progress.total}}...</p>
					<p class = "content">Found {{progress.unsupported}} unsupported file(s) and encountered {{progress.errors}} error(s)</p>
					<a v-on:click = "cancelClicked()" class="button is-danger is-outlined">
						<span class="icon">
							<i class="fa fa-ban"></i>
						</span>
						<span>Cancel</span>
					</a>
				</div>
			</div>
		</section>
	</template>
	`,
	data: () => {
		return {
			progress: {
				processed: 0,
				total: 0,
				unsupported: 0,
				errors: 0
			},
			shouldContinue: true
		}
	},
	created: function() {
		let vm = this;
		let scanner = remote.require("./scan");
		scanner.launch(NotificationCenter.folderPath, NotificationCenter.recursively, (callback) => callback(vm.shouldContinue), (progress) => {
			vm.progress = progress;
			vm.$forceUpdate();
		}, (media) => {
			NotificationCenter.media = media;
			NotificationCenter.$emit("changeView", "main-view-controller");
		});
	},
	methods: {
		cancelClicked: function () {
			this.shouldContinue = false;
			NotificationCenter.$emit("changeView", "upload-view-controller");
		}
	}
});
