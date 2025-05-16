const {Column,Entity,PrimaryGeneratedColumn} =require('typeorm');

@Entity()
class User{
    @PrimaryGeneratedColumn()
    id;
    @Column({unique:true})
    email;
    @Column()
    passwordHash;
    @Column()
    name;
    @Column({default:false})
    isVerfied;
    @Column({nullable:true})
    verificationToken;
    @Column({default:true})
    isTrial;
    @Column({type:'date',nullable:true})
    trialStartDate;
    @Column({type:'date',nullable:true})
    trialEndDate;
    @Column({default:0})
    apiCallCount;
    @Column({default:100})
    apiCallLimit; // <-- Rule's that will be applied to trial users only 
}
module.exports = User;