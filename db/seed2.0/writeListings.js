const faker = require('faker');
const _ = require('lodash');
const { titleStrings, bedStrings } = require('../../util/seedStrings.js');
const pickWeighted = require('../../util/pickWeighted.js');

const writeListings = (targetedRecords, userIds, writable, sendBackData) => {
  const listingIds = [];
  const bedrooms = [];
  let lines = targetedRecords;
  let i = 1;

  writable.write('"listingId","user_id","title","body","guests","bedrooms","beds","publicBaths","privateBaths"\n', () => {
    writeLines();

    function writeLines() {
      let okayToWrite = true;

      while (lines >= 0 & okayToWrite) {
        // =====VARIOUS=====
        const id = `${i}`.padStart(8, '0');
        listingIds.push(id);
        const user = _.sample(userIds);
        const body = faker.lorem.paragraphs(2);
        const guests = _.random(1, 5);
        const publicBaths = _.random(0, 10);
        const privateBaths = _.random(publicBaths === 0 ? 1 : 0, 10);

        // =====TITLE=====
        const adjective = _.sample(titleStrings.adjective);
        const place = _.sample(titleStrings.place);
        const location = _.sample(titleStrings.location);
        const title = `${adjective} ${place} in ${location}`;

        // =====ROOMS=====
        const totalBedroomsForListing = pickWeighted(_.range(1, 11), [2, 2, 3]);
        let totalBedsForListing = 0;
        let hasCommonArea = false;
        let roomCounter = 1;

        for (let b = 0; b < totalBedroomsForListing; b += 1) {
          // =====Build base bedroom object=====
          const newBedroom = {
            listing_id: id,
            id: `br-${id}-${b}`,
          };
          bedStrings.forEach((bedString) => {
            const spaces = /\s/;
            bedString = bedString.replace(spaces, '');
            newBedroom[bedString] = 0;
          });

          // =====Add room-specific properties=====
          const thisRoomBeds = _.random(1, 5);
          totalBedsForListing += thisRoomBeds;
          newBedroom.numBeds = thisRoomBeds;
          let bedroomName;
          if (hasCommonArea) {
            bedroomName = `Bedroom${roomCounter}`;
          } else {
            bedroomName = _.random(0, 3) ? `Bedroom${roomCounter}` : 'Common Space';
          }
          if (bedroomName === 'Common Space') {
            hasCommonArea = true;
          } else {
            roomCounter += 1;
          }
          newBedroom.name = bedroomName;
          bedrooms.push(newBedroom);
        }
        // =====COMBINE=====
        const newLine = `"${id}","${user}","${title}","${body}",${guests}, ${totalBedroomsForListing}, ${totalBedsForListing}, ${publicBaths},${privateBaths}\n`;

        if (lines === 0) {

          sendBackData(listingIds, bedrooms);
          break;
        } else {
          okayToWrite = writable.write(newLine);
          lines -= 1;
          i += 1;
        }
      }

      if (lines > 0) {
        writable.once('drain', writeLines);
      }
    }
  });
};

module.exports = writeListings;