import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import React from "react";

const Wareki = {
  reiwa: { start: 2019, end: null, label: "令和", prefixes: ["令和", "令", "R", "r"] },
  heisei: { start: 1989, end: 2019, label: "平成", prefixes: ["平成", "平", "H", "h"] },
  showa: { start: 1926, end: 1989, label: "昭和", prefixes: ["昭和", "昭", "S", "s"] },
  taisho: { start: 1912, end: 1926, label: "大正", prefixes: ["大正", "大", "T", "t"] },
  meiji: { start: 1868, end: 1912, label: "明治", prefixes: ["明治", "明", "M", "m"] },
};

type WarekiKey = keyof typeof Wareki;

const calc = (targetYear: number) => {
  return Object.keys(Wareki).reduce(
    (prev, current) => {
      const { start, end, label } = Wareki[current as WarekiKey];
      if (targetYear < start) return prev;

      return end && targetYear > end
        ? [...prev, `(${label}${targetYear - start + 1}年)`]
        : [...prev, `${label}${targetYear - start + 1}年`];
    },
    [`西暦${targetYear}年`]
  );
};

// こんな感じの正規表現を生成する
// ^(令和|令|R|平成|平|H|昭和|昭|S|大正|大|T|明治|明|M)(\d+)
const warekiExtractRegex = () => {
  const allPrefixes = Object.keys(Wareki).reduce<string[]>((prev, current) => {
    const { prefixes } = Wareki[current as WarekiKey];
    return [...prev, ...prefixes];
  }, []);

  return new RegExp(`^(${allPrefixes.join("|")})(\\d+)`);
};

const convertYear = (sourceYear: string) => {
  // 西暦
  if (Number(sourceYear) > 0) {
    return Number(sourceYear);
  }

  // 和暦
  const [_, sourceEraName, sourceEraYear] = sourceYear.match(warekiExtractRegex()) ?? [];
  for (const [_, { start, prefixes }] of Object.entries(Wareki)) {
    if (prefixes.findIndex((a) => a === sourceEraName) >= 0) {
      // 各年号の開始年+各年号の年数-1
      return start + Number(sourceEraYear) - 1;
    }
  }

  return NaN;
};

export default function Command() {
  const [searchYear, setSearchYear] = React.useState("");

  const year = convertYear(searchYear);
  const items = isNaN(year) ? [] : calc(year);

  return (
    <List
      isLoading={items.length === 0}
      searchBarPlaceholder="Enter year of 西暦 or 和暦"
      enableFiltering={false}
      onSearchTextChange={setSearchYear}
    >
      {items.map((item) => {
        return (
          <List.Item
            key={item}
            title={item}
            actions={<Actions item={item} />}
            icon={{ source: Icon.Circle, tintColor: Color.Green }}
          />
        );
      })}
    </List>
  );
}

function Actions({ item }: { item: string }) {
  return (
    <ActionPanel title="Wareki - 和暦西暦変換">
      <Action.CopyToClipboard content={item} title="Copy" />
    </ActionPanel>
  );
}
