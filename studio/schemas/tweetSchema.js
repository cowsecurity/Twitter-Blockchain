export const tweetSchema = {
  name: "tweets",
  title: "Tweets",
  type: "document",
  fields: [
    {
      name: "tweet",
      title: "Tweet",
      type: "string",
    },
    {
      name: "timestamp",
      title: "Timestamp",
      type: "datetime",
    },
    {
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "users" }],
    },
  ],
};
