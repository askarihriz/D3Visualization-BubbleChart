import { useEffect, useRef } from "react";
import sourceData from "./assets/source_code_data.json";
import * as d3 from "d3";

function App() {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    console.log("Data", sourceData);
    if (sourceData.data && sourceData.data.length) {
      const width = 1200;
      const height = 800;
      const margin = { top: 50, right: 150, bottom: 50, left: 100 };
      const overlapOffset = 7;

      sourceData.data = sourceData.data.map((d) => ({
        ...d,
        lastedit: d3.timeParse("%d-%m-%Y")(d.lastedit),
        linesCount: d.lines.length,
      }));

      const developerColors = {
        John: "rgb(255, 0, 0)", // Red
        Alex: "rgb(0, 0, 255)", // Blue
        Bob: "rgb(0, 128, 0)", // Green
      };

      const minDate = d3.min(sourceData.data, (d) => d.lastedit);
      const maxDate = d3.max(sourceData.data, (d) => d.lastedit);
      const xDomain = [
        d3.timeMonth.offset(minDate, -0.5),
        d3.timeMonth.offset(maxDate, 1),
      ];

      const xScale = d3
        .scaleTime()
        .domain(xDomain)
        .range([margin.left, width - margin.right]);

      const yScale = d3
        .scalePoint()
        .domain(sourceData.data.map((d) => d.filename))
        .range([height - margin.bottom, margin.top])
        .padding(0.5);

      const radiusScale = d3
        .scaleSqrt()
        .domain(d3.extent(sourceData.data, (d) => d.linesCount))
        .range([5, 20]);

      const svg = d3
        .select(svgRef.current)
        .attr("width", width)
        .attr("height", height);

      svg.selectAll("*").remove();

      svg
        .append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(
          d3.axisBottom(xScale).ticks(6).tickFormat(d3.timeFormat("%b %Y"))
        );

      svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

      svg
        .selectAll(".dotted-line")
        .data(sourceData.data)
        .enter()
        .append("line")
        .attr("class", "dotted-line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", (d) => yScale(d.filename))
        .attr("y2", (d) => yScale(d.filename))
        .attr("stroke", "lightgrey")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4, 4")
        .attr("opacity", 0.5);

      const tooltip = d3
        .select(tooltipRef.current)
        .style("position", "absolute")
        .style("padding", "8px")
        .style("background", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0);

      sourceData.data.forEach((d) => {
        const baseX = xScale(d.lastedit);
        const yPosition = yScale(d.filename);
        const radius = radiusScale(d.linesCount);

        d.developer.forEach((dev, i) => {
          svg
            .append("circle")
            .attr("cx", baseX + i * overlapOffset)
            .attr("cy", yPosition)
            .attr("r", radius)
            .attr("fill", developerColors[dev] || "black")
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .on("mouseover", () => {
              tooltip
                .style("opacity", 1)
                .html(
                  `Developers: ${d.developer.join(", ")}<br>Lines Edited: ${
                    d.linesCount
                  }`
                )
                .style("left", `${d3.event?.pageX + 10}px`)
                .style("top", `${d3.event?.pageY - 10}px`);
            })
            .on("mousemove", () => {
              tooltip
                .style("left", `${d3.event?.pageX + 10}px`)
                .style("top", `${d3.event?.pageY - 10}px`);
            })
            .on("mouseout", () => {
              tooltip.style("opacity", 0);
            });
        });
      });

      const legend = svg
        .append("g")
        .attr(
          "transform",
          `translate(${width - margin.right + 20},${margin.top})`
        );

      Object.entries(developerColors).forEach(([dev, color], i) => {
        legend
          .append("circle")
          .attr("cx", 0)
          .attr("cy", i * 35)
          .attr("r", 12)
          .attr("fill", color)
          .attr("stroke", "black")
          .attr("stroke-width", 1);

        legend
          .append("text")
          .attr("x", 20)
          .attr("y", i * 35)
          .attr("dy", "0.20em")
          .text(dev)
          .style("font-size", "16px")
          .style("alignment-baseline", "middle");
      });
    }
  }, [sourceData.data]);

  return (
    <>
      <div className="flex flex-col space-y-4 m-4">
        <div>
          <h1 className="text-3xl font-bold underline">Task 2a:</h1>
          <h1 className="text-3xl font-bold text-red-600">
            Static Visualization using D3.js
          </h1>
        </div>

        <div style={{ position: "relative" }}>
          <svg ref={svgRef}></svg>
          <div ref={tooltipRef} className="tooltip"></div>
        </div>
      </div>
    </>
  );
}

export default App;
