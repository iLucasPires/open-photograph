import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vueDevTools from "vite-plugin-vue-devtools";
import ui from "@nuxt/ui/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      ui({
        ui: {
          colors: {
            primary: "yellow",
            neutral: "olive",
          },
          modal: {
            slots: {
              overlay: "z-40 bg-inverted/20 backdrop-blur-sm",
              content:
                "z-50 bg-default rounded-lg shadow-xl ring-1 ring-default divide-y divide-default",
              header: "px-5 py-4 sm:px-6 sm:py-5",
              body: "p-5 sm:p-6",
              footer: "gap-2 px-5 py-4 sm:px-6",
              title: "font-sans text-base font-semibold tracking-tight text-highlighted",
              description: "mt-1 text-sm leading-relaxed text-muted",
            },
          },
          input: {
            defaultVariants: {
              variant: "subtle",
              size: "xs",
            },
          },
          select: {
            slots: {
              content: "z-[60]",
            },
            defaultVariants: {
              variant: "subtle",
              size: "xs",
            },
          },
          textarea: {
            defaultVariants: {
              variant: "subtle",
              size: "xs",
            },
          },
          selectMenu: {
            defaultVariants: {
              variant: "subtle",
              size: "xs",
            },
          },
          inputMenu: {
            defaultVariants: {
              variant: "subtle",
              size: "xs",
            },
          },
          inputNumber: {
            defaultVariants: {
              variant: "subtle",
              size: "xs",
            },
          },
          inputTags: {
            defaultVariants: {
              variant: "subtle",
              size: "xs",
            },
          },
          inputDate: {
            defaultVariants: {
              variant: "subtle",
              size: "xs",
            },
          },
          inputTime: {
            defaultVariants: {
              variant: "subtle",
              size: "xs",
            },
          },
          pinInput: {
            defaultVariants: {
              variant: "subtle",
              size: "xs",
            },
          },
          button: {
            defaultVariants: {
              size: "xs",
            },
          },
          badge: {
            defaultVariants: {
              size: "xs",
            },
          },
          inputRating: {
            defaultVariants: {
              size: "xs",
            },
          },
          tabs: {
            defaultVariants: {
              size: "xs",
            },
          },
          checkbox: {
            defaultVariants: {
              size: "xs",
            },
          },
          checkboxGroup: {
            defaultVariants: {
              size: "xs",
            },
          },
          radioGroup: {
            defaultVariants: {
              size: "xs",
            },
          },
          switch: {
            defaultVariants: {
              size: "xs",
            },
          },
          slider: {
            defaultVariants: {
              size: "xs",
            },
          },
          stepper: {
            defaultVariants: {
              size: "xs",
            },
          },
          calendar: {
            defaultVariants: {
              size: "xs",
            },
          },
          colorPicker: {
            defaultVariants: {
              size: "xs",
            },
          },
          fileUpload: {
            defaultVariants: {
              size: "xs",
            },
          },
          formField: {
            defaultVariants: {
              size: "xs",
            },
          },
          fieldGroup: {
            defaultVariants: {
              size: "xs",
            },
          },
          dropdownMenu: {
            defaultVariants: {
              size: "xs",
            },
          },
          contextMenu: {
            defaultVariants: {
              size: "xs",
            },
          },
          commandPalette: {
            defaultVariants: {
              size: "xs",
            },
          },
          listbox: {
            defaultVariants: {
              size: "xs",
            },
          },
        },
        autoImport: {
          // Only framework-level globals (ref/computed/watch/useRoute/useDebounceFn/...)
          // are auto-imported. Project code (composables, types, utils, constants,
          // schemas) uses explicit imports — see AGENTS.md → Auto-imports for why.
          imports: ["@vueuse/core", "vue", "vue-router"],
        },
        components: {
          dts: true,
          prefix: "C",
          // Components stay auto-registered (name = filename, prefixed `C`) — the
          // discoverability win here is worth the "where's this defined" cost, unlike
          // composables/types/utils/constants which now use explicit imports (see
          // AGENTS.md → Auto-imports).
          // Route pages are imported by routes.ts and must not be auto-registered.
          dirs: ["./src/app/features/*/components", "./src/app/shared/components"],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    optimizeDeps: {
      include: [
        "@nuxt/ui > prosemirror-state",
        "@nuxt/ui > prosemirror-transform",
        "@nuxt/ui > prosemirror-model",
        "@nuxt/ui > prosemirror-view",
        "@nuxt/ui > prosemirror-gapcursor",
      ],
    },

    server: {
      // WSL2 doesn't reliably propagate inotify events to chokidar (native fs events
      // silently miss brand-new files, especially — hence "useDocumentRealtime is not
      // defined" right after adding a new composable file, until a full restart).
      // Polling sidesteps that at the cost of a bit of CPU.
      watch: {
        usePolling: true,
        interval: 300,
      },
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
