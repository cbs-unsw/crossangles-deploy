import React, { ReactNode } from 'react';
import ReactGA from 'react-ga';
import { Meta } from '../state/Meta'
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import { CourseData } from '../state/Course';
import { CATEGORY } from '../analytics';
import { makeStyles } from '@material-ui/core';

export interface Props {
  additional: CourseData[],
  meta: Meta,
  link?: boolean,
  disclaimer?: boolean,
  typographyProps?: TypographyProps,
  className?: string,
  onShowContact: () => void,
}

const useStyles = makeStyles(theme => ({
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

const InfoText = ({
  additional,
  meta,
  typographyProps,
  link = true,
  disclaimer = false,
  className,
  onShowContact,
}: Props) => {
  const classes = useStyles();

  // Assumption: only one additional course will be auto-selected and has metadata
  const ministry = additional.filter(c => c.autoSelect && c.metadata)[0];

  const handleLinkClick = (action: string, destination?: string) => {
    ReactGA.event({
      category: CATEGORY,
      action,
      label: destination,
    });
  }

  let ministryPromo: ReactNode = null;
  if (ministry) {
    const ministryMeta = ministry.metadata!;

    const textParts = ministryMeta.promoText.split('{link}');
    const items: ReactNode[] = [textParts.shift() || ''];
    for (let [i, textPart] of textParts.entries()) {
      const linkEl = link ? (
        <a
          key={`linkPart-${i}`}
          href={ministryMeta.website}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.link}
          onClick={() => handleLinkClick('Ministry Link', ministryMeta.website)}
        >{ministry.name}</a>
      ) : (
        <React.Fragment key={`linkPart-${i}`}>{ministry.name}</React.Fragment>
      );
      const textEl = <React.Fragment key={`textPart-${i}`}>{textPart}</React.Fragment>;
      items.push(linkEl, textEl);
    }

    ministryPromo = (
      <Typography {...typographyProps} paragraph>
        {items}
      </Typography>
    );
  }


  return (
    <div className={className}>
      {ministryPromo}

      {disclaimer && (
        <Typography {...typographyProps} paragraph>
          The data was last updated
          at <span style={{ fontWeight: 400 }}>
            {meta.updateTime} ({meta.updateDate})
          </span> from <a
            href={meta.source}
            target="_blank"
            rel="noopener noreferrer"
            className={classes.link}
            onClick={() => handleLinkClick('ClassUtil Link', meta.source)}
          >
            {meta.source}
          </a>.
          CrossAngles comes without any guarantee of data accuracy or of optimality.
          If you have any questions or suggestions,
          please <span
            className={classes.link}
            onClick={(event) => { event.preventDefault(); onShowContact() }}
          >
            contact us
          </span>.
        </Typography>
      )}
    </div>
  )
}

export default InfoText;
