fuser -n tcp -k 5000 

Penambahan Fitur Selanjutnya:
 - Ubah Menjadi Format Aplikasi Waingapu Shop Zone (done)
 - Tambahkan Fitur Kategori pada produk (post digantikan dengan produk karena sudah mengubah menjadi Aplikasi Waingapu Shop Zone)
 - Tambahkan Ada Nomor Telfon (kalau bisa sosial media (link)) untuk models user pada database
 - Lakukan pencarian produk berdasarkan kategori, nama produk
 - Login dengan email dan password (Tidak bisa, The most widely used way for websites to authenticate users is via a username and password. )
 - Registrasi dengan email verivikasi (done)
 - try and catch lebih baik
 - Struktur folder lebih baik.
 - Refactoring code lebih baik.
 - Buat UI lebih baik dengan bootstrap(template) atau tailwindcss (murni custom)

 <% layout('layouts/boilerplate') -%>

<div class="gradient-custom-landing-page leading-normal tracking-normal mb-8 text-white">
 	
<!--Hero-->
	<div class="pt-24">

		<div class="container px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center">
			<!--Left Col-->
			<div class="flex flex-col w-full md:w-2/5 justify-center items-start text-center md:text-left">
				<p class="uppercase tracking-loose w-full">Siap untuk terkoneksi dengan para penjual ?</p>
				<h1 class="my-4 text-5xl font-bold leading-tight">Selamat Datang Di Waingapu Shop Zone</h1>
				<p class="leading-normal text-2xl mb-8">Koneksikan diri anda dengan para penjual yang ada di sekitar kota waingapu</p>
						
			</div>
			<!--Right Col-->
			<div class="md:w-3/5 py-6 text-center md:block lg:block hidden">
				<img class="md:w-2/5 z-50" src="images/connection-landing-page.png">
			</div>
			
		</div>

	</div>


	<div class="relative -mt-12 lg:-mt-24">
		<svg viewBox="0 0 1428 174" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
		<g transform="translate(-2.000000, 44.000000)" fill="#FFFFFF" fill-rule="nonzero">
		<path d="M0,0 C90.7283404,0.927527913 147.912752,27.187927 291.910178,59.9119003 C387.908462,81.7278826 543.605069,89.334785 759,82.7326078 C469.336065,156.254352 216.336065,153.6679 0,74.9732496" opacity="0.100000001"></path>
		<path d="M100,104.708498 C277.413333,72.2345949 426.147877,52.5246657 546.203633,45.5787101 C666.259389,38.6327546 810.524845,41.7979068 979,55.0741668 C931.069965,56.122511 810.303266,74.8455141 616.699903,111.243176 C423.096539,147.640838 250.863238,145.462612 100,104.708498 Z" opacity="0.100000001"></path>
		<path d="M1046,51.6521276 C1130.83045,29.328812 1279.08318,17.607883 1439,40.1656806 L1439,120 C1271.17211,77.9435312 1140.17211,55.1609071 1046,51.6521276 Z" id="Path-4" opacity="0.200000003"></path>
		</g>
		<g transform="translate(-4.000000, 76.000000)" fill="#FFFFFF" fill-rule="nonzero">
		<path d="M0.457,34.035 C57.086,53.198 98.208,65.809 123.822,71.865 C181.454,85.495 234.295,90.29 272.033,93.459 C311.355,96.759 396.635,95.801 461.025,91.663 C486.76,90.01 518.727,86.372 556.926,80.752 C595.747,74.596 622.372,70.008 636.799,66.991 C663.913,61.324 712.501,49.503 727.605,46.128 C780.47,34.317 818.839,22.532 856.324,15.904 C922.689,4.169 955.676,2.522 1011.185,0.432 C1060.705,1.477 1097.39,3.129 1121.236,5.387 C1161.703,9.219 1208.621,17.821 1235.4,22.304 C1285.855,30.748 1354.351,47.432 1440.886,72.354 L1441.191,104.352 L1.121,104.031 L0.457,34.035 Z"></path>
		</g>
		</g>
		</svg>
	</div>
 
</div>
 

<div id="map"></div>

<section id="new-product" class="p-4">
	<div class="text-center p-4">
		<p class="mr-auto text-5xl border-gray-600 border-b-2 inline-block mb-2">Penjualan Terbaru</p>		
	</div>
	<div class="flex justify-center">
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 p-2">
			<div class="max-w-sm rounded overflow-hidden shadow-lg">
			  <img class="w-full" src="/img/card-top.jpg" alt="Sunset in the mountains">
			  <div class="px-6 py-4">
			    <div class="font-bold text-xl mb-2">The Coldest Sunset</div>
			    <p class="text-gray-700 text-base">
			      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
			    </p>
			  </div>
			  <div class="px-6 py-4">
			    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">#photography</span>
			    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">#travel</span>
			    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">#winter</span>
			  </div>
			</div>

			<div class="max-w-sm rounded overflow-hidden shadow-lg">
			  <img class="w-full" src="/img/card-top.jpg" alt="Sunset in the mountains">
			  <div class="px-6 py-4">
			    <div class="font-bold text-xl mb-2">The Coldest Sunset</div>
			    <p class="text-gray-700 text-base">
			      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
			    </p>
			  </div>
			  <div class="px-6 py-4">
			    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">#photography</span>
			    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">#travel</span>
			    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">#winter</span>
			  </div>
			</div>
		
			<div class="max-w-sm rounded overflow-hidden shadow-lg sm:mr-8">
			  <img class="w-full" src="/img/card-top.jpg" alt="Sunset in the mountains">
			  <div class="px-6 py-4">
			    <div class="font-bold text-xl mb-2">The Coldest Sunset</div>
			    <p class="text-gray-700 text-base">
			      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
			    </p>
			  </div>
			  <div class="px-6 py-4">
			    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">#photography</span>
			    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">#travel</span>
			    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">#winter</span>
			  </div>
			</div>
		</div>			
	</div>	
</section>

<script>
	// mengambil access token mapbox
	mapboxgl.accessToken = "<%= mapBoxToken %>";
	// membuat variabel products menjadi data JSON dari data products yang dikirimkan dari server.
	let products = { features: <%- JSON.stringify(products) %> }; 
</script>

<script src="/javascripts/allProductsClusterMap.js"></script>


				<!-- <img src="<%= currentUser.image.secure_url %>" alt="<%= currentUser.username %> profile image" class="profile-image rounded-full w-full"> -->


r3ndydinar username
r3ndycoder password