import { useEffect, useRef } from 'react';

import * as d3 from 'd3';
import { Box, BoxProps, styled } from 'leather-styles/jsx';

interface PortfolioData {
  token: string;
  percentage: number;
  color: string;
}

const portfolioData: PortfolioData[] = [
  { token: 'BTC', percentage: 40, color: '#F7931A' },
  { token: 'STX', percentage: 30, color: '#5546FF' },
  { token: 'ETH', percentage: 10, color: '#627EEA' },
  { token: 'USDT', percentage: 8, color: '#26A17B' },
  { token: 'SOL', percentage: 5, color: '#14F195' },
  { token: 'AVAX', percentage: 4, color: '#E84142' },
  { token: 'MATIC', percentage: 2, color: '#8247E5' },
  { token: 'ADA', percentage: 1, color: '#0033AD' },
];

export function PortfolioChart(props: BoxProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const container = svgRef.current.parentElement;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;

        const height = 32;
        const margin = { top: 0, right: 0, bottom: 0, left: 0 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);

        let cumulativePercentage = 0;
        const barPadding = 4;

        g.selectAll('rect')
          .data(portfolioData)
          .enter()
          .append('rect')
          .attr('x', (d, i) => {
            const x = xScale(cumulativePercentage);
            cumulativePercentage += d.percentage;
            return i === 0 ? x : x + barPadding / 2;
          })
          .attr('y', 0)
          .attr('width', (d, i, nodes) => {
            const baseWidth = xScale(d.percentage);
            if (i === 0 && i === nodes.length - 1) return baseWidth;
            if (i === 0 || i === nodes.length - 1) return baseWidth - barPadding / 2;
            return baseWidth - barPadding;
          })
          .attr('height', innerHeight)
          .attr('fill', d => d.color)
          .attr('rx', 4);

        g.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', innerWidth)
          .attr('height', innerHeight)
          .attr('fill', 'none')
          .attr('stroke', 'none');
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <Box {...props}>
      <styled.h3 textStyle="heading.05" mb="space.04">
        Portfolio performance
      </styled.h3>
      <Box borderRadius="md" border="default" bg="ink.background-secondary" p="space.05">
        <svg ref={svgRef} style={{ display: 'block', width: '100%' }} />
      </Box>
    </Box>
  );
}
