import gql from "graphql-tag";

export const GET_PROFILE = gql`
  query whoami {
    whoAmI {
      id
      email
      username
    }
  }
`;

export async function getProfile(client: any) {
  const result = await client.query({
    query: GET_PROFILE,
  });
  console.log("result", result); //"{data:{test:1}}"
  return result;
}

export default {
  getProfile,
};
