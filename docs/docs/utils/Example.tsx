import React, { ReactNode, useEffect, useRef, useState } from "react";

type ExampleProps = {
  summary: ReactNode;
  children?: (open: boolean) => ReactNode;
};

export const Example = (props: ExampleProps) => {
  const selfRef = useRef<HTMLDetailsElement>();
  const [open, setOpen] = useState(!!selfRef.current?.hasAttribute("open"));

  useEffect(() => {
    const obs = new MutationObserver(([mr]) => {
      if (mr.type === "attributes" && mr.attributeName === "open") {
        setOpen((mr.target as HTMLDetailsElement).hasAttribute("open"));
      }
    });
    obs.observe(selfRef.current!, {
      attributes: true,
      attributeFilter: ["open"],
    });

    return () => obs.disconnect();
  }, []);

  return (
    <details
      ref={selfRef}
      className="details_node_modules-@docusaurus-theme-common-lib-components-Details-styles-module isBrowser_node_modules-@docusaurus-theme-common-lib-components-Details-styles-module alert alert--info details_node_modules-@docusaurus-theme-classic-lib-theme-Details-styles-module"
    >
      <summary>{props.summary}</summary>
      {props.children(open)}
    </details>
  );
};
