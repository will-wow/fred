import _ = require('lodash');
import moment = require('moment-timezone');
const ig = require('instagram-node').instagram();

const PIZZA_ID = '264145867'; // ID for the 800degreespizza user.
const TIMEZONE = 'America/Los_Angeles';

/**
 * Slack attachment for potds.
 * Use like: robot.emit('slack.attachment', pieAttachment);
 */
export interface PieAttachment {
  channel: string;
  fallback: string;
  content: {
    title: string;
    title_link: string;
    text: string;
    thumb_url: string;
  };
}

ig.use({
  client_id: process.env.INSTAGRAM_CLIENT_ID,
  client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
  access_token: process.env.INSTAGRAM_ACCESS_TOKEN
});

class PieChecker {
  /**
   * Checks for Pies of the Day.
   */
  constructor(

  ) {

  }

  public getLastPie(room: string): Promise<PieAttachment> {
    return new Promise((resolve, reject) => {
      /* OPTIONS: { [count], [min_timestamp], [max_timestamp], [min_id], [max_id] }; */
      ig.user_media_recent(PIZZA_ID, {
        count: 5
      }, (err, medias, pagination, remaining, limit) => {
        let pieOfTheDay;

        if (err) {
          console.log('INSTAGRAM ERROR', err);
          reject();
          return;
        }

        // Loop through the posts, looking for the potd.
        _.forEach(medias, (post) => {
          // If we reach a post not from today, then there's no potd.
          if (!this.isPostFromToday(post)) {
            return false;
          }

          if (this.isPieOfTheDay(post)) {
            // Get the pie.
            pieOfTheDay = post;
            // Stop looping.
            return false;
          }
        });

        if (!pieOfTheDay) {
          reject();
          return;
        }

        resolve(this.formatSlackAttachment(room, pieOfTheDay));
      });
    });
  }

  /**
   * Returns a slack attachment for a pie post.
   * @param post - The Instagram post data.
   * @returns The stack attachment data.
   */
  private formatSlackAttachment(room: string, post): PieAttachment {
    const attachment: PieAttachment = {
      channel: room,
      fallback: '',
      content: {
        title: 'Pie of the day! :pizza:',
        title_link: post.link,
        text: post.caption.text,
        thumb_url: post.images.thumbnail.url
      }
    };

    // Put together the fallback.
    attachment.fallback = `${attachment.content.title} ${attachment.content.text}: ${attachment.content.title_link}`;

    return attachment;
  }

  private isPostFromToday(post): boolean {
    // Don't worry about day for development after midnight or on the weekend.
    if (process.env.PIE_OF_THE_DAY_DEV) {
      return true;
    }

    // Convert to epoch time.
    const createdTime = _.toNumber(post.created_time + '000');
    const today = moment().tz(TIMEZONE);

    return moment.tz(createdTime, TIMEZONE).isSame(today, 'day');
  }

  /**
   * Checks if a post is probably for the pie of the day.
   * @param post - The Instagram post data.
   * @returns True if the post is for the pie of the day.
   */
  private isPieOfTheDay(post): boolean {
    return post.type === 'image' && (
      _.includes(post.tags, 'potd') ||
      post.caption.text.includes('of the day') ||
      post.caption.text.includes('potd')
    );
  }
}

export default PieChecker;
