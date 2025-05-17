const {Column,Entity,PrimaryGeneratedColumn} =require('typeorm');

@Entity()
class User{
    @PrimaryGeneratedColumn()
    id;
    @Column({type:'varchar',unique:true})
    email;
    @Column({type:'varchar'})
    passwordHash;
    @Column({type:'varchar'})
    name;
    @Column({default:false,type:'boolean'})
    isVerfied;
    @Column({type:'varchar',nullable:true})
    verificationToken;
    @Column({default:true,type:'boolean'})
    isTrial;
    @Column({type:'date',nullable:true})
    trialStartDate;
    @Column({type:'date',nullable:true})
    trialEndDate;
    @Column({type:'integer',default:0})
    apiCallCount;
    @Column({type:'integer',default:100})
    apiCallLimit; // <-- Rule's that will be applied to trial users only 
}
module.exports = User;