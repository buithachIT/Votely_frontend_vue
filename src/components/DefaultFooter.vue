<template>
  <footer class="bg-white border-t border-slate-100 pt-12 pb-8 px-4 mt-20">
    <div class="max-w-6xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div class="col-span-1 md:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <div
              class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200"
            >
              <span class="text-white font-black text-lg">V</span>
            </div>
            <span
              class="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600"
            >
              Votely
            </span>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed">
            Nền tảng bình chọn thời gian thực mượt mà nhất. Giúp bạn ra quyết định nhanh chóng và
            minh bạch.
          </p>
        </div>

        <div>
          <h4 class="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Tính năng</h4>
          <ul class="space-y-3">
            <li>
              <a href="#" class="text-slate-500 hover:text-indigo-600 text-sm transition"
                >Tạo cuộc thăm dò</a
              >
            </li>
            <li>
              <a href="#" class="text-slate-500 hover:text-indigo-600 text-sm transition"
                >Bình chọn Real-time</a
              >
            </li>
            <li>
              <a href="#" class="text-slate-500 hover:text-indigo-600 text-sm transition"
                >Kết quả trực quan</a
              >
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Tài nguyên</h4>
          <ul class="space-y-3">
            <li>
              <a href="#" class="text-slate-500 hover:text-indigo-600 text-sm transition"
                >Hướng dẫn sử dụng</a
              >
            </li>
            <li>
              <a href="#" class="text-slate-500 hover:text-indigo-600 text-sm transition"
                >API Documentation</a
              >
            </li>
            <li>
              <a href="#" class="text-slate-500 hover:text-indigo-600 text-sm transition"
                >Chính sách bảo mật</a
              >
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Kết nối</h4>
          <div class="flex gap-4 mb-4">
            <a
              href="#"
              class="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              <i class="pi pi-facebook"></i>
            </a>
            <a
              href="#"
              class="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              <i class="pi pi-github"></i>
            </a>
            <a
              href="#"
              class="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              <i class="pi pi-envelope"></i>
            </a>
          </div>
          <p class="text-xs text-slate-400">Hỗ trợ: buithach.dev@gmail.com</p>
        </div>
      </div>

      <div
        class="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <p class="text-slate-400 text-xs">
          &copy; {{ new Date().getFullYear() }} Votely. Được thiết kế bởi
          <span class="text-slate-600 font-medium">Bùi Thạch</span>.
        </p>
        <div class="flex items-center gap-6">
          <span class="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
            <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Hệ thống đang hoạt động
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Thêm font xịn xịn nếu ông muốn */
footer {
  font-family: 'Inter', sans-serif;
}
</style>
