const Domain = require("../models/Domain");
const WarmupGroup = require("../models/WarmUpGroup");
const mongoose = require("mongoose");
const { addIssuedDomains } = require("../utilities/functions");

exports.createWarmUpGroup = async (req, res) => {
    try {
        const { selectedDomainsIds } = req.body;
        WarmupGroup.findOne({ priority: { $ne: true }, name: { $regex: "^Group" } }).sort({ createdAt: -1 }).exec(async function(err, group) {
            let count = 0;
            if(group?.name) {
                count = group.name.split(' ')[1];
            }

            const newGroup = new WarmupGroup({
                name: `Group ${Number(count) + 1}`,
                domains: selectedDomainsIds,
                priority: false,
            });
    
            await newGroup.save();

            selectedDomainsIds.forEach(async (domain) => {
                await Domain.findOneAndUpdate(
                    { _id: domain },
                    { $set: { group: newGroup._id } }
                );
            })
    
            return res.status(200).send({
              message: "Group successfully created.",
              success: true,
              data: newGroup,
            });
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
            success: false,
        });
    }
}

exports.getWarmUpGroups = async (req, res) => {
    try {
        addIssuedDomains();
        let { limit, page, sortField = "createdAt", sortOrder = "desc" } = req.body;
        limit = limit - 1
        sortOrder = sortOrder === "desc" ? -1 : 1;

        let warmupGroups;
        
        if(limit && page) {
            warmupGroups = await WarmupGroup.find({ priority: { $ne: true } })
            .collation({ locale: "en", strength: 2 })
            .populate("domains")
            .sort({ [sortField]: sortOrder })
            .skip(limit * parseInt(page) - limit)
            .limit(limit);
        } else {
            warmupGroups = await WarmupGroup.find({ priority: { $ne: true } })
            .collation({ locale: "en", strength: 2 })
            .populate("domains")
            .sort({ [sortField]: sortOrder })
        }
        
        if(page === 1 || !page) {
            const issuedDomainsGroup = await WarmupGroup.findOne({ priority: true }).collation({ locale: "en", strength: 2 })
            .populate("domains");
            warmupGroups.push(issuedDomainsGroup);
        }

        let totalGroups = await WarmupGroup.countDocuments();

        return res.status(200).send({
            message: "All warmup groups.",
            success: true,
            total: totalGroups,
            data: warmupGroups,
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
            success: false,
        });
    }
}

exports.getWarmUpGroupsByIds = async (req, res) => {
    try {
        const warmupGroups = await WarmupGroup.find({
            '_id': { $in: req.body.warmupGroupsIds}
        })
        .collation({ locale: "en", strength: 2 })
        .populate("domains")
        .sort({ "createdAt": "desc" });

        return res.status(200).send({
            message: "All warmup groups.",
            success: true,
            data: warmupGroups,
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
            success: false,
        });
    }
}

exports.updateWarmUpGroup = async (req, res) => {
    try {
        const { groupId, domains, name, action } = req.body;

        if(action === "add") {
            const group = await WarmupGroup.findOne({ _id: groupId });
            group.domains = group.domains.concat(domains);
            await group.save();
            domains.forEach(async (domainId) => {
                const domain = await Domain.findOne({_id: domainId});
                domain.group = groupId;
                domain.save();
            })
        } else if(action === "remove") {
            const group = await WarmupGroup.findOne({ _id: groupId });
            group.domains = group.domains.filter(domainId => String(domainId) !== domains[0]);
            if(!group.domains.length) {
                await WarmupGroup.deleteOne({ _id: groupId });
            } else {
                await group.save();
            }
            domains.forEach(async (domainId) => {
                const domain = await Domain.findOne({_id: domainId});
                domain.group = null;
                domain.save();
            })
        } else if(action === "update") {
            const group = await WarmupGroup.findOne({ _id: groupId });
            group.domains = domains;
            group.save();
        }

        if(name) {
            await WarmupGroup.findOneAndUpdate(
                { _id: groupId },
                { $set: { name } }
            );
        }

        return res.status(200).send({
          message: "Group successfully updated.",
          success: true,
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
            success: false,
        });
    }
}

exports.deleteWarmUpGroup = async (req, res) => {
    try {
        const { groupId } = req.body;

        await WarmupGroup.deleteOne({ _id: groupId });
        Domain.updateMany({ group: groupId }, { $set: { group: null } });

        return res.status(200).send({
          message: "Group successfully deleted.",
          success: true,
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
            success: false,
        });
    }
}