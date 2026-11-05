/**
 * Compact AWS service glyphs for the ambient icon field.
 * Hand-authored SVG shapes styled after the official AWS Architecture
 * icon set, using the official AWS service category colors
 * (e.g. EC2 #ED7100, S3 #569A31, RDS #527FFF, VPC #8C4FFF…).
 * Drawn on a 24×24 grid, single-color fills, no text.
 */

export type AwsGlyph = { id: string; label: string; svg: string };

const wrap = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">${body}</svg>`;

export const AWS_GLYPHS: AwsGlyph[] = [
  {
    id: "ec2",
    label: "Amazon EC2",
    svg: wrap(
      `<rect x="6" y="6" width="12" height="12" rx="2" fill="#ED7100"/>
       <rect x="9.5" y="9.5" width="5" height="5" rx="1" fill="#fff" opacity=".85"/>
       <g stroke="#ED7100" stroke-width="1.6" stroke-linecap="round">
         <path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3"/>
       </g>`,
    ),
  },
  {
    id: "s3",
    label: "Amazon S3",
    svg: wrap(
      `<path d="M4 6.5c0-1.4 3.6-2.5 8-2.5s8 1.1 8 2.5-3.6 2.5-8 2.5S4 7.9 4 6.5z" fill="#569A31"/>
       <path d="M4 6.5v11c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-11c0 1.4-3.6 2.5-8 2.5S4 7.9 4 6.5z" fill="#569A31" opacity=".65"/>
       <path d="M4 12c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/>`,
    ),
  },
  {
    id: "lambda",
    label: "AWS Lambda",
    svg: wrap(
      `<path d="M13.2 3 6 13.4h4.4L9.6 21 18 10.2h-4.7L13.2 3z" fill="#ED7100"/>`,
    ),
  },
  {
    id: "vpc",
    label: "Amazon VPC",
    svg: wrap(
      `<path d="M12 2.6 20.4 7v10L12 21.4 3.6 17V7L12 2.6z" fill="none" stroke="#8C4FFF" stroke-width="1.8"/>
       <path d="M8.6 12.2 11 14.6l4.6-4.8" fill="none" stroke="#8C4FFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    ),
  },
  {
    id: "rds",
    label: "Amazon RDS",
    svg: wrap(
      `<ellipse cx="12" cy="6" rx="7.2" ry="3" fill="#527FFF"/>
       <path d="M4.8 6v12c0 1.7 3.2 3 7.2 3s7.2-1.3 7.2-3V6c0 1.7-3.2 3-7.2 3S4.8 7.7 4.8 6z" fill="#527FFF" opacity=".7"/>
       <ellipse cx="12" cy="6" rx="7.2" ry="3" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>`,
    ),
  },
  {
    id: "ecs",
    label: "Amazon ECS",
    svg: wrap(
      `<rect x="3.5" y="4" width="11" height="11" rx="1.6" fill="#FF9900"/>
       <rect x="9.5" y="9.5" width="11" height="11" rx="1.6" fill="#FF9900" opacity=".6"/>`,
    ),
  },
  {
    id: "ecr",
    label: "Amazon ECR",
    svg: wrap(
      `<rect x="3.5" y="5" width="17" height="14" rx="2" fill="none" stroke="#FF9900" stroke-width="1.7"/>
       <path d="M8 12h8M13 9l3 3-3 3" fill="none" stroke="#FF9900" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`,
    ),
  },
  {
    id: "cloudwatch",
    label: "Amazon CloudWatch",
    svg: wrap(
      `<circle cx="12" cy="12" r="8.4" fill="none" stroke="#FF4F8B" stroke-width="1.8"/>
       <path d="M12 7.4V12l3.2 2.2" fill="none" stroke="#FF4F8B" stroke-width="1.8" stroke-linecap="round"/>`,
    ),
  },
  {
    id: "iam",
    label: "AWS IAM",
    svg: wrap(
      `<path d="M12 2.8 19.4 6v6.1c0 4.3-3 7.4-7.4 9.1-4.4-1.7-7.4-4.8-7.4-9.1V6L12 2.8z" fill="#DD344C"/>
       <circle cx="12" cy="10.6" r="1.9" fill="#fff" opacity=".9"/>
       <path d="M12 12.5v3.4" stroke="#fff" stroke-width="1.7" stroke-linecap="round" opacity=".9"/>`,
    ),
  },
  {
    id: "cloudfront",
    label: "Amazon CloudFront",
    svg: wrap(
      `<circle cx="12" cy="12" r="8.4" fill="none" stroke="#8C4FFF" stroke-width="1.7"/>
       <path d="M3.8 12h16.4M12 3.6c2.4 2.4 3.6 5.3 3.6 8.4S14.4 18 12 20.4C9.6 18 8.4 15.1 8.4 12S9.6 6 12 3.6z" fill="none" stroke="#8C4FFF" stroke-width="1.4"/>`,
    ),
  },
  {
    id: "codebuild",
    label: "AWS CodeBuild",
    svg: wrap(
      `<path d="M14.8 3.6a4.6 4.6 0 0 0-5.5 6.1L3.8 15.2a2 2 0 1 0 2.8 2.8l5.5-5.5a4.6 4.6 0 0 0 6.1-5.5l-2.9 2.9-2.4-.6-.6-2.4 2.5-3.3z" fill="#FF4F8B"/>`,
    ),
  },
  {
    id: "codedeploy",
    label: "AWS CodeDeploy",
    svg: wrap(
      `<rect x="3.6" y="7" width="12.4" height="12" rx="2" fill="#FF4F8B" opacity=".65"/>
       <path d="M8 4.4h9.6a2 2 0 0 1 2 2V13" fill="none" stroke="#FF4F8B" stroke-width="1.7" stroke-linecap="round"/>
       <path d="M9.8 13.4 12.4 16l4.2-4.6" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`,
    ),
  },
  {
    id: "dynamodb",
    label: "Amazon DynamoDB",
    svg: wrap(
      `<rect x="4" y="5" width="16" height="14" rx="3" fill="#C925D1"/>
       <path d="M10.4 8 7.6 12.8h2.9L9.4 16.6 13.4 12h-2.9l1-4z" fill="#fff" opacity=".92"/>`,
    ),
  },
  {
    id: "sqs",
    label: "Amazon SQS",
    svg: wrap(
      `<rect x="3" y="7" width="6.4" height="10" rx="1.6" fill="#FF4F8B"/>
       <rect x="10.8" y="7" width="6.4" height="10" rx="1.6" fill="#FF4F8B" opacity=".6"/>
       <path d="M19.4 12h2" stroke="#FF4F8B" stroke-width="1.9" stroke-linecap="round"/>`,
    ),
  },
  {
    id: "route53",
    label: "Amazon Route 53",
    svg: wrap(
      `<circle cx="12" cy="12" r="8.4" fill="none" stroke="#8C4FFF" stroke-width="1.7"/>
       <path d="M12 3.6v16.8M3.6 12h16.8" stroke="#8C4FFF" stroke-width="1.2" opacity=".8"/>
       <circle cx="12" cy="12" r="2.6" fill="#8C4FFF"/>`,
    ),
  },
  {
    id: "sns",
    label: "Amazon SNS",
    svg: wrap(
      `<circle cx="12" cy="12" r="3.1" fill="#DD344C"/>
       <g stroke="#DD344C" stroke-width="1.7" stroke-linecap="round">
         <path d="M12 4.4v2.4M12 17.2v2.4M4.4 12h2.4M17.2 12h2.4M6.7 6.7l1.7 1.7M15.6 15.6l1.7 1.7M17.3 6.7l-1.7 1.7M8.4 15.6l-1.7 1.7"/>
       </g>`,
    ),
  },
];
