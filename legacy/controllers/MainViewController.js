Vue.component("main-view-controller", {
	template: `
	<div id = "MainView">
		<div class="modal">
			<div class="modal-background"></div>
			<div class="modal-card">
				<header class="modal-card-head">
					<p class="modal-card-title">Modal title</p>
					<button class="delete"></button>
				</header>
				<section class="modal-card-body">
					<!-- Content ... -->
				</section>
				<footer class="modal-card-foot">
					<a class="button is-primary">Save changes</a>
					<a class="button">Cancel</a>
				</footer>
			</div>
		</div>
		<nav class="nav">
			<!-- Add the modifier "is-active" to display it on mobile -->
			<div class="nav-left">
				<a class="nav-item">
					IMG_0651.jpg
				</a>
				<a class="nav-item">
					4000x6000
				</a>
				<a class="nav-item">
					2.51MB
				</a>
			</div>
			<!-- <div class = "nav-middle">
				<a class="nav-item">
					Undo delete
				</a>
			</div> -->
			<div class = "nav-right is-active">
				<span class = "nav-item">
					<a class = "button">
						<span class = "icon">
							<i class = "fa fa-folder"></i>
						</span>
					</a>
					<a class = "button is-danger">
						<span class = "icon">
							<i class = "fa fa-trash"></i>
						</span>
					</a>
					<a class = "button is-outlined">
						<span class = "icon">
							<i class = "fa fa-chevron-circle-left"></i>
						</span>
					</a>
					<a class = "button is-outlined">
						<span class = "icon">
							<i class = "fa fa-chevron-circle-right"></i>
						</span>
					</a>
				</span>
			</div>
		</nav>
		<img id = "image" src = "file:///Users/Andi/Documents/Test/IMG_0572.jpg" />
	</div>
	`,
	data: () => {
		return {
			// media: NotificationCenter.media,
			// visibleMedia: NotificationCenter.media.slice(0, 10)
		}
	},
	created: function() {
		let vm = this;
	},
	methods: {
		select: function(n) {
			NotificationCenter.$emit("select", n);
		}
	},
});