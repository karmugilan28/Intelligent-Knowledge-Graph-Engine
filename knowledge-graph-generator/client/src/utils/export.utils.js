export const exportToJSON = (roadmap, title) => {
  if (!roadmap) return;
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roadmap, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `${title.replace(/\s+/g, '_')}_Roadmap.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const exportToMarkdown = (roadmap, title) => {
  if (!roadmap) return;
  let mdContent = `# ${title} Learning Roadmap\n\n`;
  mdContent += `## Target Concept: ${roadmap.targetConcept}\n\n`;
  
  if (roadmap.curriculumMetrics) {
    mdContent += `### Curriculum Health Score: ${roadmap.overallScore}/100\n`;
    mdContent += `- Dependency Coverage: ${roadmap.curriculumMetrics.dependencyCoverage}%\n`;
    mdContent += `- Difficulty Smoothness: ${roadmap.curriculumMetrics.difficultySmoothness}%\n`;
    mdContent += `- Learning Continuity: ${roadmap.curriculumMetrics.learningContinuity}%\n`;
    mdContent += `- Concept Coverage: ${roadmap.curriculumMetrics.conceptCoverage}%\n\n`;
  }

  mdContent += `## Path\n\n`;
  roadmap.path.forEach((step, idx) => {
    mdContent += `### ${idx + 1}. ${step.concept}\n`;
    mdContent += `- **Category**: ${step.category}\n`;
    mdContent += `- **Difficulty**: ${step.difficulty}/10\n`;
    mdContent += `- **Estimated Time**: ${step.estimatedTime}\n`;
    mdContent += `- **Description**: ${step.description}\n\n`;
  });

  mdContent += `## Study Guide\n\n${roadmap.studyGuide}\n`;

  const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(mdContent);
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `${title.replace(/\s+/g, '_')}_Roadmap.md`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
