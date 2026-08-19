"use client";

import { Info } from "lucide-react";
import ColorSelector from "./ColorSelector";
import OptionGroup from "./OptionGroup";
import DimensionSelector from "./DimensionSelector";
import QuantitySelector from "./QuantitySelector";
import { useDesigner } from "../state/designerStore";
import { SECTION_LABEL_CLASS } from "../designerTokens";

export default function Configurator() {
  const { config, updateConfig } = useDesigner();

  return (
    <aside className="flex flex-col gap-6 border-r border-design-border p-6">
      <header>
        <p className={SECTION_LABEL_CLASS}>Configurator</p>
        <h2 className="mt-1 text-lg font-semibold text-design-text">
          Color palette vectorizer
        </h2>
      </header>

      <ColorSelector />

      <OptionGroup
        title="Edge"
        options={[{ label: "With border", value: "border" }]}
        active={config.edge ? "border" : null}
        onSelect={() => updateConfig({ edge: !config.edge })}
      />

      <OptionGroup
        title="Flame-retardant"
        icon={
          <span className="text-design-text-muted">
            <Info className="h-3.5 w-3.5" />
          </span>
        }
        options={[
          { label: "Without", value: "without" },
          { label: "With (+€45 net)", value: "with" },
        ]}
        active={config.flameRetardant ? "with" : "without"}
        onSelect={(value) => updateConfig({ flameRetardant: value === "with" })}
      />

      <OptionGroup
        title="Form"
        options={[
          { label: "Square", value: "square" },
          { label: "Around", value: "around" },
        ]}
        active={config.form}
        onSelect={(value) =>
          updateConfig({ form: value === "around" ? "around" : "square" })
        }
      />

      <OptionGroup
        title="Format"
        options={[
          { label: "standard", value: "standard" },
          { label: "Wish", value: "wish" },
        ]}
        active={config.format}
        onSelect={(value) =>
          updateConfig({ format: value === "wish" ? "wish" : "standard" })
        }
      />

      <DimensionSelector />

      <QuantitySelector />
    </aside>
  );
}