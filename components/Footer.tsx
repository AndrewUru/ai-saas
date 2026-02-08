import Link from "next/link";

const navigation = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Agents", href: "/dashboard/agents" },
      { label: "Pricing", href: "/pricing" },
      { label: "Integrations", href: "/integrations" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/dashboard/docs" },
      { label: "Academy", href: "/academy" },
      { label: "Changelog", href: "/changelog" },
      { label: "Community", href: "/community" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
  },
];

const social = [{ label: "GitHub", href: "https://github.com/Andrewuru" }];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative border-t border-white/5 bg-[#030303] pt-16 pb-8 overflow-hidden"
      data-oid="nplcr8i"
    >
      {/* Luz de fondo sutil */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
        data-oid="rp1kbbu"
      />

      <div
        className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none"
        data-oid="sd.kuwi"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8" data-oid="hl8n_10">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8" data-oid="salkxr5">
          {/* Columna de Marca y Newsletter */}
          <div className="space-y-8" data-oid="2roe_qi">
            <div
              className="flex items-center gap-2 text-white"
              data-oid="7d1ms1t"
            >
              <div
                className="h-6 w-6 rounded bg-gradient-to-br from-white to-zinc-500"
                data-oid="n54juxs"
              />

              <span
                className="text-lg font-bold tracking-tight"
                data-oid="5chw.zz"
              >
                AI Agents
              </span>
            </div>

            <p
              className="text-sm leading-6 text-zinc-400 max-w-sm"
              data-oid="t:dy127"
            >
              Deploy intelligent support agents for WooCommerce. Automate
              responses, scale your agency, and keep control.
            </p>

            <div className="relative max-w-sm" data-oid="m0wi0ul">
              <label
                htmlFor="newsletter"
                className="sr-only"
                data-oid="ddfj5_-"
              >
                Subscribe to newsletter
              </label>
              <div className="flex gap-2" data-oid="paw-3gv">
                <input
                  type="email"
                  name="newsletter"
                  id="newsletter"
                  className="w-full min-w-0 flex-auto rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/5 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-white/20 sm:text-sm sm:leading-6 transition-all hover:bg-white/10"
                  placeholder="Enter your email"
                  data-oid="f1ljexs"
                />

                <button
                  type="submit"
                  className="flex-none rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-black shadow-sm hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
                  data-oid="tykmblw"
                >
                  Subscribe
                </button>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 pt-2" data-oid="kz7x-d4">
              <span className="relative flex h-2 w-2" data-oid="f06f415">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                  data-oid="t68q3-h"
                ></span>
                <span
                  className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
                  data-oid="q.jc0mc"
                ></span>
              </span>
              <span
                className="text-xs font-medium text-zinc-400"
                data-oid="iozf64x"
              >
                All systems operational
              </span>
            </div>
          </div>

          {/* Grid de Navegación */}
          <div
            className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0"
            data-oid="r1_wa:2"
          >
            <div className="md:grid md:grid-cols-2 md:gap-8" data-oid="jrtrsp3">
              <div data-oid="7px3ypo">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider text-white"
                  data-oid="-.po:5c"
                >
                  Product
                </h3>
                <ul role="list" className="mt-6 space-y-4" data-oid="k4x-2r0">
                  {navigation[0].links.map((item) => (
                    <li key={item.label} data-oid="liz5j_r">
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-zinc-400 hover:text-white transition-colors"
                        data-oid="b2q9xvh"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0" data-oid="g21mq47">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider text-white"
                  data-oid="1h4.edo"
                >
                  Resources
                </h3>
                <ul role="list" className="mt-6 space-y-4" data-oid="2ni.eu6">
                  {navigation[1].links.map((item) => (
                    <li key={item.label} data-oid="e9sz2co">
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-zinc-400 hover:text-white transition-colors"
                        data-oid=":5is6x0"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8" data-oid="fhh1h_g">
              <div data-oid="3nuq:3v">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider text-white"
                  data-oid="k5nu9an"
                >
                  Company
                </h3>
                <ul role="list" className="mt-6 space-y-4" data-oid="iu0ozfc">
                  {navigation[2].links.map((item) => (
                    <li key={item.label} data-oid="ajcp0ly">
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-zinc-400 hover:text-white transition-colors"
                        data-oid="vh5d2:w"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0" data-oid="wagy86s">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider text-white"
                  data-oid="idk7j8i"
                >
                  Legal
                </h3>
                <ul role="list" className="mt-6 space-y-4" data-oid="1ll89te">
                  <li data-oid="7m8m48.">
                    <Link
                      href="/privacy"
                      className="text-sm leading-6 text-zinc-400 hover:text-white transition-colors"
                      data-oid="foxjri8"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li data-oid="v6utxtz">
                    <Link
                      href="/terms"
                      className="text-sm leading-6 text-zinc-400 hover:text-white transition-colors"
                      data-oid="3g7k.fc"
                    >
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          className="mt-16 border-t border-white/5 pt-8 sm:mt-20 lg:mt-24 flex flex-col md:flex-row justify-between items-center gap-6"
          data-oid="5lq500r"
        >
          <p className="text-xs leading-5 text-zinc-500" data-oid="giyn14f">
            &copy; {year} AI Agents Inc. All rights reserved.
          </p>

          <div className="flex space-x-6" data-oid="amuavl9">
            {social.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-zinc-500 hover:text-white transition-colors"
                data-oid="5ldl1d5"
              >
                <span className="sr-only" data-oid="tbjr64p">
                  {item.label}
                </span>
                {/* SVG Placeholders para iconos sociales limpios */}
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  data-oid=":ye3bqi"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                    data-oid="rha_ov4"
                  />
                </svg>
              </a>
            ))}
            <a
              href="mailto:atobio459@gmail.com"
              className="text-zinc-500 hover:text-white transition-colors text-xs font-medium flex items-center"
              data-oid="efaw_da"
            >
              atobio459@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
