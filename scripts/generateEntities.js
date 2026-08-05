const getIcon = require("./iconGenerator");
const fs = require("fs-extra");

async function generateEntities(articles) {
  const entities = {};

  for (const article of articles) {
    if (!article.entities) continue;

    for (const entity of article.entities) {
      if (!entities[entity.id]) {
        entities[entity.id] = {
    id: entity.id,
    symbol: entity.symbol,
    name: entity.name,
    type: entity.type,
    path: entity.path,
    icon: getIcon(entity),
    count: 0
};
      }

      entities[entity.id].count++;
    }
  }

  const list = Object.values(entities).sort((a, b) => b.count - a.count);

  await fs.writeJson(
    "./output/entities.json",
    {
      updated_at: new Date().toISOString(),
      total: list.length,
      entities: list
    },
    { spaces: 2 }
  );

  console.log(`✅ entities.json (${list.length})`);
}

module.exports = generateEntities;