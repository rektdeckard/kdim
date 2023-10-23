import van from "./van-1.2.3.min";
import { Random } from "../src";

import "./index.css";

const { div, pre } = van.tags;

export default function Randoms() {
  const friends = ["alice", "bob", "carlos", "dan", "erin"];
  const secretSantas = Random.derangement(friends);

  return div(
    pre(`\
const friends = ["alice", "bob", "carlos", "dan", "erin"];
const secretSantas = Random.derangement(friends);\
      `),
    pre(JSON.stringify(friends)),
    pre(JSON.stringify(secretSantas))
  );
}
