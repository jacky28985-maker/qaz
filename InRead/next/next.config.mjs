/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: "/search", destination: "/legacy/search.html", permanent: false },
      { source: "/library", destination: "/legacy/library.html", permanent: false },
      { source: "/test", destination: "/legacy/test.html", permanent: false },
      { source: "/result", destination: "/legacy/result.html", permanent: false },
      { source: "/plan", destination: "/legacy/plan.html", permanent: false },
      { source: "/study", destination: "/legacy/study.html", permanent: false },
      { source: "/gate", destination: "/legacy/gate.html", permanent: false }
    ];
  }
};

export default nextConfig;
